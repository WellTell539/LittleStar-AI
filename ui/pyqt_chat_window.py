import sys, os; sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))
import sys, datetime
import logging
from PyQt5.QtWidgets import QApplication, QWidget, QTextEdit, QSizePolicy, QGraphicsBlurEffect, QHBoxLayout, QLabel, QVBoxLayout, QStackedLayout, QPushButton, QStackedWidget, QDesktopWidget, QScrollArea, QSplitter, QGraphicsDropShadowEffect
from PyQt5.QtCore import Qt, QRect, QThread, pyqtSignal, QParallelAnimationGroup, QPropertyAnimation, QEasingCurve, QTimer
from PyQt5.QtGui import QColor, QPainter, QBrush, QFont, QPixmap, QPalette, QPen
from conversation_core import NagaConversation
import os
from config import config # 导入统一配置
from i18n.language_manager import get_language_manager, t
from ui.response_utils import extract_message  # 新增：引入消息提取工具
from ui.progress_widget import EnhancedProgressWidget  # 导入进度组件
from ui.enhanced_worker import StreamingWorker, BatchWorker  # 导入增强Worker
from ui.elegant_settings_widget import ElegantSettingsWidget
from ui.emotion_panel import EmotionPanel
import asyncio
import json
import threading
from PyQt5.QtCore import QObject, pyqtSignal as Signal

# 设置日志
logger = logging.getLogger(__name__)

# 使用统一配置系统
BG_ALPHA = config.ui.bg_alpha
WINDOW_BG_ALPHA = config.ui.window_bg_alpha
USER_NAME = config.ui.user_name
MAC_BTN_SIZE = config.ui.mac_btn_size
MAC_BTN_MARGIN = config.ui.mac_btn_margin
MAC_BTN_GAP = config.ui.mac_btn_gap
ANIMATION_DURATION = config.ui.animation_duration

class TitleBar(QWidget):
    def __init__(s, text, parent=None):
        super().__init__(parent)
        s.text = text
        s.setFixedHeight(100)
        s.setAttribute(Qt.WA_TranslucentBackground)
        s._offset = None
        # 科幻风格按钮
        for i,(txt,color,hover,cb) in enumerate([
            ('-','#6A8CFF','#8AACFF',lambda:s.parent().showMinimized()),
            ('×','#9966FF','#B586FF',lambda:s.parent().close())]):
            btn=QPushButton(txt,s)
            btn.setGeometry(s.width()-MAC_BTN_MARGIN-MAC_BTN_SIZE*(2-i)-MAC_BTN_GAP*(1-i),36,MAC_BTN_SIZE,MAC_BTN_SIZE)
            btn.setStyleSheet(f"QPushButton{{background:{color};border:none;border-radius:{MAC_BTN_SIZE//2}px;color:#fff;font:18pt;}}QPushButton:hover{{background:{hover};}}")
            btn.clicked.connect(cb)
            setattr(s,f'btn_{"min close".split()[i]}',btn)
    def mousePressEvent(s, e):
        if e.button()==Qt.LeftButton: s._offset = e.globalPos()-s.parent().frameGeometry().topLeft()
    def mouseMoveEvent(s, e):
        if s._offset and e.buttons()&Qt.LeftButton:
            s.parent().move(e.globalPos()-s._offset)
    def mouseReleaseEvent(s,e):s._offset=None
    def paintEvent(s, e):
        qp = QPainter(s)
        qp.setRenderHint(QPainter.Antialiasing)
        w, h = s.width(), s.height()
        qp.setPen(QColor(255,255,255,180))
        qp.drawLine(0, 2, w, 2)
        qp.drawLine(0, h-3, w, h-3)
        font = QFont("Consolas", max(10, (h-40)//2), QFont.Bold)
        qp.setFont(font)
        rect = QRect(0, 20, w, h-40)
        for dx,dy in [(-1,0),(1,0),(0,-1),(0,1)]:
            qp.setPen(QColor(20,10,40))
            qp.drawText(rect.translated(dx,dy), Qt.AlignCenter, s.text)
        qp.setPen(QColor(150,200,255))
        qp.drawText(rect, Qt.AlignCenter, s.text)
    def resizeEvent(s,e):
        x=s.width()-MAC_BTN_MARGIN
        for i,btn in enumerate([s.btn_min,s.btn_close]):btn.move(x-MAC_BTN_SIZE*(2-i)-MAC_BTN_GAP*(1-i),36)

class AnimatedSideWidget(QWidget):
    """自定义侧栏Widget，支持动画发光效果"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.bg_alpha = int(BG_ALPHA * 255)
        self.border_alpha = 50
        self.glow_intensity = 0  # 发光强度 0-20
        self.is_glowing = False
        
    def set_background_alpha(self, alpha):
        """设置背景透明度"""
        self.bg_alpha = alpha
        self.update()
        
    def set_border_alpha(self, alpha):
        """设置边框透明度"""
        self.border_alpha = alpha
        self.update()
        
    def set_glow_intensity(self, intensity):
        """设置发光强度 0-20"""
        self.glow_intensity = max(0, min(20, intensity))
        self.update()
        
    def start_glow_animation(self):
        """开始发光动画"""
        self.is_glowing = True
        self.update()
        
    def stop_glow_animation(self):
        """停止发光动画"""
        self.is_glowing = False
        self.glow_intensity = 0
        self.update()
        
    def paintEvent(self, event):
        """自定义绘制方法"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        rect = self.rect()
        
        # 绘制发光效果（如果有）
        if self.glow_intensity > 0:
            glow_rect = rect.adjusted(-2, -2, 2, 2)
            glow_color = QColor(100, 200, 255, self.glow_intensity)
            painter.setPen(QPen(glow_color, 2))
            painter.setBrush(QBrush(Qt.NoBrush))
            painter.drawRoundedRect(glow_rect, 17, 17)
        
        # 绘制主要背景
        bg_color = QColor(17, 17, 17, self.bg_alpha)
        painter.setBrush(QBrush(bg_color))
        
        # 绘制边框
        border_color = QColor(255, 255, 255, self.border_alpha)
        painter.setPen(QPen(border_color, 1))
        
        # 绘制圆角矩形
        painter.drawRoundedRect(rect, 15, 15)
        
        super().paintEvent(event)

class AutoFitLabel(QLabel):
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.setWordWrap(True)
    def resizeEvent(self, event):
        super().resizeEvent(event)
        # 自动调整字体大小以适应标签大小
        font = self.font()
        font_size = min(self.width() // 20, self.height() // 2, 16)
        font.setPointSize(max(font_size, 8))
        self.setFont(font)

class ChatWindow(QWidget):
    def __init__(s):
        super().__init__()
        
        # 获取屏幕大小并自适应
        desktop = QDesktopWidget()
        screen_rect = desktop.screenGeometry()
        # 设置为屏幕大小的80%
        window_width = int(screen_rect.width() * 0.8)
        window_height = int(screen_rect.height() * 0.8)
        s.resize(window_width, window_height)
        
        # 窗口居中显示
        x = (screen_rect.width() - window_width) // 2
        y = (screen_rect.height() - window_height) // 2
        s.move(x, y)
        
        # 移除置顶标志，保留无边框
        s.setWindowFlags(Qt.FramelessWindowHint)
        s.setAttribute(Qt.WA_TranslucentBackground)
        
        # 添加窗口背景和拖动支持
        s._offset = None
        s.setStyleSheet(f"""
            ChatWindow {{
                background: rgba(15, 25, 45, {WINDOW_BG_ALPHA});
                border-radius: 20px;
                border: 2px solid rgba(150, 200, 255, 60);
            }}
        """)
        
        fontfam,fontbig,fontsize='Lucida Console',16,16
        
        # 创建主分割器，替换原来的HBoxLayout
        s.main_splitter = QSplitter(Qt.Horizontal, s)
        s.main_splitter.setStyleSheet("""
            QSplitter {
                background: transparent;
            }
            QSplitter::handle {
                background: rgba(120, 140, 255, 30);
                width: 2px;
                border-radius: 1px;
            }
            QSplitter::handle:hover {
                background: rgba(150, 170, 255, 60);
                width: 3px;
            }
        """)
        
        # 聊天区域容器
        chat_area=QWidget()
        chat_area.setMinimumWidth(400)  # 设置最小宽度
        vlay=QVBoxLayout(chat_area);vlay.setContentsMargins(0,0,0,0);vlay.setSpacing(10)
        
        # 用QStackedWidget管理聊天区和设置页
        s.chat_stack = QStackedWidget(chat_area)
        s.chat_stack.setStyleSheet("""
            QStackedWidget {
                background: transparent;
                border: none;
            }
        """) # 保证背景穿透
        s.text = QTextEdit() # 聊天历史
        s.text.setReadOnly(True)
        s.text.setStyleSheet(f"""
            QTextEdit {{
                background: rgba(20,30,60,{int(BG_ALPHA*255)});
                color: #E6F3FF;
                border-radius: 15px;
                border: 2px solid rgba(120, 160, 255, 80);
                font: 16pt 'Lucida Console';
                padding: 15px;
            }}
            QScrollBar:vertical {{
                background: rgba(30, 50, 120, 150);
                width: 8px;
                border-radius: 4px;
                border: 1px solid rgba(120, 160, 255, 60);
            }}
            QScrollBar::handle:vertical {{
                background: rgba(150, 170, 255, 180);
                border-radius: 4px;
                min-height: 20px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: rgba(180, 200, 255, 220);
            }}
        """)
        s.chat_stack.addWidget(s.text) # index 0 聊天页
        s.settings_page = s.create_settings_page() # index 1 设置页
        s.chat_stack.addWidget(s.settings_page)
        vlay.addWidget(s.chat_stack, 1)
        
        # 添加进度显示组件
        s.progress_widget = EnhancedProgressWidget(chat_area)
        vlay.addWidget(s.progress_widget)
        
        s.input_wrap=QWidget(chat_area)
        s.input_wrap.setFixedHeight(48)
        hlay=QHBoxLayout(s.input_wrap);hlay.setContentsMargins(0,0,0,0);hlay.setSpacing(8)
        s.prompt=QLabel('>',s.input_wrap)
        s.prompt.setStyleSheet(f"color:#AACCFF;font:{fontsize}pt '{fontfam}';background:transparent;")
        hlay.addWidget(s.prompt)
        s.input = QTextEdit(s.input_wrap)
        s.input.setStyleSheet(f"""
            QTextEdit {{
                background: rgba(20,30,60,{int(BG_ALPHA*255)});
                color: #E6F3FF;
                border-radius: 15px;
                border: 2px solid rgba(120, 160, 255, 80);
                font: {fontsize}pt '{fontfam}';
                padding: 12px;
            }}
            QTextEdit:focus {{
                border: 2px solid rgba(150, 200, 255, 120);
                background: rgba(25,35,70,{int(BG_ALPHA*255)});
            }}
        """)
        s.input.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        s.input.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Minimum)
        hlay.addWidget(s.input)
        vlay.addWidget(s.input_wrap,0)
        
        # 将聊天区域添加到分割器
        s.main_splitter.addWidget(chat_area)
        
        # 侧栏（图片显示区域）- 使用自定义动画Widget
        s.side = AnimatedSideWidget()
        s.side.setMinimumWidth(300)  # 设置最小宽度
        s.side.setMaximumWidth(800)  # 设置最大宽度
        
        # 优化侧栏的悬停效果，使用QPainter绘制
        def setup_side_hover_effects():
            def original_enter(e):
                s.side.set_background_alpha(int(BG_ALPHA * 0.5 * 255))
                s.side.set_border_alpha(80)
            def original_leave(e):
                s.side.set_background_alpha(int(BG_ALPHA * 255))
                s.side.set_border_alpha(50)
            return original_enter, original_leave
        
        s.side_hover_enter, s.side_hover_leave = setup_side_hover_effects()
        s.side.enterEvent = s.side_hover_enter
        s.side.leaveEvent = s.side_hover_leave
        
        # 设置鼠标指针，提示可点击
        s.side.setCursor(Qt.PointingHandCursor)
        
        stack=QStackedLayout(s.side);stack.setContentsMargins(5,5,5,5)
        s.img=QLabel(s.side)
        s.img.setSizePolicy(QSizePolicy.Ignored,QSizePolicy.Ignored)
        s.img.setAlignment(Qt.AlignCenter)
        s.img.setMinimumSize(1,1)
        s.img.setMaximumSize(16777215,16777215)
        s.img.setStyleSheet('background:transparent; border: none;')
        stack.addWidget(s.img)
        nick=QLabel(f"● StarryNight{config.system.version}",s.side)
        nick.setStyleSheet("""
            QLabel {
                color: #AACCFF;
                font: 18pt 'Consolas';
                background: rgba(30,20,70,100);
                padding: 12px 0 12px 0;
                border-radius: 10px;
                border: none;
            }
        """)
        nick.setAlignment(Qt.AlignHCenter|Qt.AlignTop)
        nick.setAttribute(Qt.WA_TransparentForMouseEvents)
        stack.addWidget(nick)
        
        # 将侧栏添加到分割器
        s.main_splitter.addWidget(s.side)
        
        # 创建情绪面板（如果启用）
        if config.emotional_ai.enabled and config.ui.show_emotion_panel:
            s.emotion_panel = EmotionPanel()
            s.emotion_panel.thinking_requested.connect(s.on_thinking_requested)
            s.emotion_panel.search_requested.connect(s.on_search_requested)
            
            # 设置情绪面板状态回调
            s.emotion_panel.set_status_callback(lambda: s.naga.get_emotional_status())
            
            # 将情绪面板添加到分割器
            s.main_splitter.addWidget(s.emotion_panel)
            
            # 设置分割器的初始比例 (聊天区:侧栏:情绪面板 = 3:2:1)
            total_width = window_width
            s.main_splitter.setSizes([total_width // 2, total_width // 3, config.ui.emotion_panel_width])
        else:
            s.emotion_panel = None
            # 设置分割器的初始比例
            s.main_splitter.setSizes([window_width * 2 // 3, window_width // 3])  # 2:1的比例
        
        # 创建包含分割器的主布局
        main=QVBoxLayout(s)
        main.setContentsMargins(10,110,10,10)
        main.addWidget(s.main_splitter)
        
        s.nick=nick
        # 使用全局单例实例，避免重复初始化
        from main import get_global_naga_instance
        s.naga=get_global_naga_instance()
        
        # 设置UI回调给NagaConversation
        s.naga.set_ui_callback(s.on_ai_proactive_message)
        
        # 初始化通知管理器
        try:
            from ui.notification_manager import initialize_ui_notifications
            s.notification_manager = initialize_ui_notifications(s)
            logger.info("✅ 通知管理器初始化成功")
        except Exception as e:
            logger.error(f"通知管理器初始化失败: {e}")
        
        s.worker=None
        s.full_img=0 # 立绘展开标志
        s.streaming_mode = True  # 默认启用流式模式
        s.current_response = ""  # 当前响应缓冲
        s.animating = False  # 动画标志位，动画期间为True
        s._img_inited = False  # 标志变量，图片自适应只在初始化时触发一次
        
        # 连接进度组件信号
        s.progress_widget.cancel_requested.connect(s.cancel_current_task)
        
        s.input.textChanged.connect(s.adjust_input_height)
        s.input.installEventFilter(s)
        s.setLayout(main)
        s.titlebar = TitleBar('StarryNight AGENT', s)
        s.titlebar.setGeometry(0,0,s.width(),100)
        s.side.mousePressEvent=s.toggle_full_img # 侧栏点击切换聊天/设置
        s.resizeEvent(None)  # 强制自适应一次，修复图片初始尺寸

    def create_settings_page(s):
        page = QWidget()
        page.setObjectName("SettingsPage")
        page.setStyleSheet("""
            #SettingsPage {
                background: transparent;
                border-radius: 24px;
                padding: 12px;
            }
        """)
        layout = QVBoxLayout(page)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # 添加返回按钮
        return_button = QPushButton("← 返回聊天")
        return_button.setFixedHeight(40)
        return_button.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #6A8CFF, stop:1 #9966FF);
                color: #FFFFFF;
                border: 2px solid rgba(150, 200, 255, 80);
                border-radius: 20px;
                font: bold 14pt '微软雅黑';
                padding: 8px 20px;
                margin: 5px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #8AACFF, stop:1 #B586FF);
                border: 2px solid rgba(180, 220, 255, 120);
            }
            QPushButton:pressed {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #5A7CDF, stop:1 #8956DF);
            }
        """)
        return_button.clicked.connect(s.return_to_chat)
        layout.addWidget(return_button)
        
        # 创建滚动区域
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll_area.setStyleSheet("""
            QScrollArea {
                background: rgba(20, 30, 60, 200);
                border: 2px solid rgba(120, 160, 255, 80);
                border-radius: 15px;
            }
            QScrollArea > QWidget > QWidget {
                background: transparent;
            }
            QScrollBar:vertical {
                background: rgba(30, 50, 120, 150);
                width: 8px;
                border-radius: 4px;
                border: 1px solid rgba(120, 160, 255, 60);
            }
            QScrollBar::handle:vertical {
                background: rgba(150, 170, 255, 180);
                border-radius: 4px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background: rgba(180, 200, 255, 220);
            }
        """)
        scroll_area.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        # 滚动内容
        scroll_content = QWidget()
        scroll_content.setStyleSheet("background: transparent;")
        scroll_content.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        scroll_layout = QVBoxLayout(scroll_content)
        scroll_layout.setContentsMargins(12, 12, 12, 12)
        scroll_layout.setSpacing(20)
        # 只保留系统设置界面
        s.settings_widget = ElegantSettingsWidget(scroll_content)
        s.settings_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        s.settings_widget.settings_changed.connect(s.on_settings_changed)
        scroll_layout.addWidget(s.settings_widget, 1)
        scroll_layout.addStretch()
        scroll_area.setWidget(scroll_content)
        layout.addWidget(scroll_area, 1)
        return page

    def resizeEvent(s, e):
        if getattr(s, '_animating', False):  # 动画期间跳过自适应刷新，提升动画流畅度
            return
        if hasattr(s,'img') and hasattr(s,'nick'):
            s.img.resize(s.img.parent().width(), s.img.parent().height())
            s.nick.resize(s.img.width(), 48) # 48为昵称高度，可自调
            s.nick.move(0,0)
            p=os.path.join(os.path.dirname(__file__),'standby.png')
            q=QPixmap(p)
            if os.path.exists(p) and not q.isNull():
                s.img.setPixmap(q.scaled(s.img.width(),s.img.height(),Qt.KeepAspectRatioByExpanding,Qt.SmoothTransformation))

    def adjust_input_height(s):
        doc = s.input.document()
        h = int(doc.size().height())+10
        s.input.setFixedHeight(min(max(48, h), 120))
        s.input_wrap.setFixedHeight(s.input.height())
        
    def eventFilter(s, obj, event):
        if obj is s.input and event.type()==6:
            if event.key()==Qt.Key_Return and not (event.modifiers()&Qt.ShiftModifier):
                s.on_send();return True
        return False
    def add_user_message(s, name, content):
        # 先把\n转成\n，再把\n转成<br>，适配所有换行
        from ui.response_utils import extract_message
        msg = extract_message(content)
        content_html = str(msg).replace('\\n', '\n').replace('\n', '<br>')
        
        # 使用更美观的字体和样式
        name_style = "color:#7FB3D3;font-size:13pt;font-family:'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;font-weight:bold;"
        content_style = "color:#FFFFFF;font-size:14pt;font-family:'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;line-height:1.4;"
        
        s.text.append(f"<span style='{name_style}'>{name}</span>")
        s.text.append(f"<span style='{content_style}'>{content_html}</span>")
        
        # 确保滚动到底部显示最新消息
        s.text.ensureCursorVisible()
    
    def add_ai_message(s, name, content, message_type="ai_message"):
        """专门用于显示AI消息的方法，样式更加醒目"""
        from ui.response_utils import extract_message
        msg = extract_message(content)
        content_html = str(msg).replace('\\n', '\n').replace('\n', '<br>')
        
        # AI消息使用特殊样式
        if message_type == "ai_proactive":
            # AI主动消息使用特殊颜色和图标
            name_style = "color:#FFD700;font-size:13pt;font-family:'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;font-weight:bold;"
            content_style = "color:#E6F3FF;font-size:14pt;font-family:'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;line-height:1.5;background:rgba(255,215,0,0.1);padding:8px;border-radius:8px;margin:4px 0;"
            icon = "🤖 "
        else:
            # 普通AI回复消息
            name_style = "color:#98FB98;font-size:13pt;font-family:'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;font-weight:bold;"
            content_style = "color:#F0F8FF;font-size:14pt;font-family:'Segoe UI', 'Microsoft YaHei', Arial, sans-serif;line-height:1.5;"
            icon = "💬 "
        
        s.text.append(f"<span style='{name_style}'>{icon}{name}</span>")
        s.text.append(f"<div style='{content_style}'>{content_html}</div>")
        s.text.append("")  # 添加空行分隔
        
        # 确保滚动到底部显示最新消息
        s.text.ensureCursorVisible()
        print(f"✅ GUI显示AI消息: {name} - {content[:50]}...")
    
    def on_send(s):
        u = s.input.toPlainText().strip()
        if u:
            s.add_user_message(USER_NAME, u)
            s.input.clear()
            
            # 如果已有任务在运行，先取消
            if s.worker and s.worker.isRunning():
                s.cancel_current_task()
                return
            
            # 清空当前响应缓冲
            s.current_response = ""
            
            # 确保worker被清理
            if s.worker:
                s.worker.deleteLater()
                s.worker = None
            
            # 根据模式选择Worker类型，创建全新实例
            if s.streaming_mode:
                s.worker = StreamingWorker(s.naga, u)
                s.setup_streaming_worker()
            else:
                s.worker = BatchWorker(s.naga, u)
                s.setup_batch_worker()
            
            # 启动进度显示 - 恢复原来的调用方式
            s.progress_widget.set_thinking_mode()
            
            # 启动Worker
            s.worker.start()
    
    def setup_streaming_worker(s):
        """配置流式Worker的信号连接"""
        s.worker.progress_updated.connect(s.progress_widget.update_progress)
        s.worker.status_changed.connect(lambda status: s.progress_widget.status_label.setText(status))
        s.worker.error_occurred.connect(s.handle_error)
        
        # 流式专用信号
        s.worker.stream_chunk.connect(s.append_response_chunk)
        s.worker.stream_complete.connect(s.finalize_streaming_response)
        s.worker.finished.connect(s.on_response_finished)
    
    def setup_batch_worker(s):
        """配置批量Worker的信号连接"""
        s.worker.progress_updated.connect(s.progress_widget.update_progress)
        s.worker.status_changed.connect(lambda status: s.progress_widget.status_label.setText(status))
        s.worker.error_occurred.connect(s.handle_error)
        s.worker.finished.connect(s.on_batch_response_finished)
    
    def append_response_chunk(s, chunk):
        """追加响应片段（流式模式）"""
        s.current_response += chunk
        # 实时更新显示（可选，避免过于频繁的更新）
        # s.update_last_message("StarryNight", s.current_response)
    
    def finalize_streaming_response(s):
        """完成流式响应"""
        if s.current_response:
            # 对累积的完整响应进行消息提取（多步自动\n分隔）
            from ui.response_utils import extract_message
            final_message = extract_message(s.current_response)
            s.add_ai_message("StarryNight", final_message, "ai_response")
        s.progress_widget.stop_loading()
    
    def on_response_finished(s, response):
        """处理完成的响应（流式模式后备）"""
        # 检查是否是取消操作的响应
        if response == "操作已取消":
            return  # 不显示，因为已经在cancel_current_task中显示了
        if not s.current_response:  # 如果流式没有收到数据，使用最终结果
            from ui.response_utils import extract_message
            final_message = extract_message(response)
            s.add_ai_message("StarryNight", final_message, "ai_response")
        s.progress_widget.stop_loading()
    
    def on_batch_response_finished(s, response):
        """处理完成的响应（批量模式）"""
        # 检查是否是取消操作的响应
        if response == "操作已取消":
            return  # 不显示，因为已经在cancel_current_task中显示了
        
        from ui.response_utils import extract_message
        final_message = extract_message(response)
        s.add_ai_message("StarryNight", final_message, "ai_response")
        s.progress_widget.stop_loading()
    
    def handle_error(s, error_msg):
        """处理错误"""
        s.add_user_message("系统", f"❌ {error_msg}")
        s.progress_widget.stop_loading()
    
    def cancel_current_task(s):
        """取消当前任务 - 优化版本，减少卡顿"""
        if s.worker and s.worker.isRunning():
            # 立即设置取消标志
            s.worker.cancel()
            
            # 非阻塞方式处理线程清理
            s.progress_widget.stop_loading()
            s.add_user_message("系统", "🚫 操作已取消")
            
            # 清空当前响应缓冲，避免部分响应显示
            s.current_response = ""
            
            # 使用QTimer延迟处理线程清理，避免UI卡顿
            def cleanup_worker():
                if s.worker:
                    s.worker.quit()
                    if not s.worker.wait(500):  # 只等待500ms
                        s.worker.terminate()
                        s.worker.wait(200)  # 再等待200ms
                    s.worker.deleteLater()
                    s.worker = None
            
            # 50ms后异步清理，避免阻塞UI
            QTimer.singleShot(50, cleanup_worker)
        else:
            s.progress_widget.stop_loading()

    def toggle_full_img(s,e):
        if getattr(s, '_animating', False):  # 动画期间禁止重复点击
            return
        s._animating = True  # 设置动画标志位
        s.full_img^=1  # 立绘展开标志切换
        target_width = 800 if s.full_img else 400  # 目标宽度
        # --- 立即切换界面状态 ---
        if s.full_img:
            s.input_wrap.hide()  # 立即隐藏输入框
            s.chat_stack.setCurrentIndex(1)  # 立即切换到设置页
            s.side.setCursor(Qt.ArrowCursor)  # 放大模式下恢复普通指针
            s.titlebar.text = "SETTING PAGE"
            s.titlebar.update()
            s.side.setStyleSheet("""
                QWidget {
                    background: rgba(25,35,70,230);
                    border-radius: 15px;
                    border: 2px solid rgba(150, 200, 255, 120);
                }
            """)
            s.side.enterEvent = s.side.leaveEvent = lambda e: None
        else:
            s.input_wrap.show()  # 立即显示输入框
            s.chat_stack.setCurrentIndex(0)  # 立即切换到聊天页
            s.input.setFocus()  # 恢复输入焦点
            s.side.setCursor(Qt.PointingHandCursor)  # 恢复点击指针
            s.titlebar.text = "StarryNight AGENT"
            s.titlebar.update()
            s.side.setStyleSheet(f"""
                QWidget {{
                    background: rgba(20,30,60,{int(BG_ALPHA*255)});
                    border-radius: 15px;
                    border: 2px solid rgba(120, 160, 255, 80);
                }}
            """)
            s.side.enterEvent = s.side_hover_enter
            s.side.leaveEvent = s.side_hover_leave
        # --- 立即切换界面状态 END ---
        group = QParallelAnimationGroup(s)
        side_anim = QPropertyAnimation(s.side, b"minimumWidth", s)
        side_anim.setDuration(ANIMATION_DURATION)
        side_anim.setStartValue(s.side.width())
        side_anim.setEndValue(target_width)
        side_anim.setEasingCurve(QEasingCurve.OutExpo)
        group.addAnimation(side_anim)
        side_anim2 = QPropertyAnimation(s.side, b"maximumWidth", s)
        side_anim2.setDuration(ANIMATION_DURATION)
        side_anim2.setStartValue(s.side.width())
        side_anim2.setEndValue(target_width)
        side_anim2.setEasingCurve(QEasingCurve.OutExpo)
        group.addAnimation(side_anim2)
        chat_area = s.side.parent().findChild(QWidget)
        if hasattr(s, 'chat_area'):
            chat_area = s.chat_area
        else:
            chat_area = s.side.parent().children()[1]
        chat_target_width = s.width() - target_width - 30  # 基于实际窗口宽度计算
        chat_anim = QPropertyAnimation(chat_area, b"minimumWidth", s)
        chat_anim.setDuration(ANIMATION_DURATION)
        chat_anim.setStartValue(chat_area.width())
        chat_anim.setEndValue(chat_target_width)
        chat_anim.setEasingCurve(QEasingCurve.OutExpo)
        group.addAnimation(chat_anim)
        chat_anim2 = QPropertyAnimation(chat_area, b"maximumWidth", s)
        chat_anim2.setDuration(ANIMATION_DURATION)
        chat_anim2.setStartValue(chat_area.width())
        chat_anim2.setEndValue(chat_target_width)
        chat_anim2.setEasingCurve(QEasingCurve.OutExpo)
        group.addAnimation(chat_anim2)
        input_hide_anim = QPropertyAnimation(s.input_wrap, b"maximumHeight", s)
        input_hide_anim.setDuration(ANIMATION_DURATION // 3)
        input_hide_anim.setStartValue(s.input_wrap.height())
        input_hide_anim.setEndValue(0 if s.full_img else 48)
        input_hide_anim.setEasingCurve(QEasingCurve.InOutQuart)
        group.addAnimation(input_hide_anim)
        input_opacity_anim = QPropertyAnimation(s.input, b"windowOpacity", s)
        input_opacity_anim.setDuration(ANIMATION_DURATION // 4)
        input_opacity_anim.setStartValue(1.0)
        input_opacity_anim.setEndValue(0.0 if s.full_img else 1.0)
        input_opacity_anim.setEasingCurve(QEasingCurve.InOutQuart)
        group.addAnimation(input_opacity_anim)
        p = os.path.join(os.path.dirname(__file__), 'standby.png')
        if os.path.exists(p):
            pixmap = QPixmap(p)
            if not pixmap.isNull():
                img_scale_anim = QPropertyAnimation(s.img, b"geometry", s)
                img_scale_anim.setDuration(ANIMATION_DURATION)
                current_rect = s.img.geometry()
                target_rect = QRect(0, 0, target_width, s.side.height())
                img_scale_anim.setStartValue(current_rect)
                img_scale_anim.setEndValue(target_rect)
                img_scale_anim.setEasingCurve(QEasingCurve.OutExpo)
                group.addAnimation(img_scale_anim)
        def on_animation_finished():
            p = os.path.join(os.path.dirname(__file__), 'standby.png')
            if os.path.exists(p):
                q = QPixmap(p)
                if not q.isNull():
                    s.img.setPixmap(q.scaled(target_width, s.side.height(), 
                                           Qt.KeepAspectRatio if s.full_img else Qt.KeepAspectRatioByExpanding, 
                                           Qt.SmoothTransformation))  # 动画结束后再缩放图片，提升流畅度
            s._animating = False  # 动画结束，允许自适应
            s.resizeEvent(None)  # 动画结束后手动刷新一次，保证布局和图片同步
        group.finished.connect(on_animation_finished)
        group.start()

    # 添加整个窗口的拖动支持
    def mousePressEvent(s, event):
        if event.button() == Qt.LeftButton:
            s._offset = event.globalPos() - s.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(s, event):
        if s._offset and event.buttons() & Qt.LeftButton:
            s.move(event.globalPos() - s._offset)
            event.accept()

    def mouseReleaseEvent(s, event):
        s._offset = None
        event.accept()

    def paintEvent(s, event):
        """绘制窗口背景"""
        painter = QPainter(s)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 绘制主窗口背景 - 使用可调节的透明度
        painter.setBrush(QBrush(QColor(25, 25, 25, WINDOW_BG_ALPHA)))
        painter.setPen(QColor(255, 255, 255, 30))
        painter.drawRoundedRect(s.rect(), 20, 20)

    def return_to_chat(s):
        """返回聊天界面"""
        try:
            # 如果当前在设置页面，切换回聊天模式
            if s.full_img:
                s.toggle_full_img(None)  # 切换回聊天页面
            
            # 确保聊天输入框获得焦点
            if hasattr(s, 'input') and s.input:
                s.input.setFocus()
            
            print("✅ 已返回聊天界面")
        except Exception as e:
            print(f"❌ 返回聊天界面失败: {e}")
    
    def on_settings_changed(s, setting_key, value):
        """处理设置变化"""
        print(f"设置变化: {setting_key} = {value}")
        
        # 这里可以实时应用某些设置变化
        if setting_key == "STREAM_MODE":
            s.streaming_mode = value
            s.add_user_message("系统", f"● 流式模式已{'启用' if value else '禁用'}")
        elif setting_key == "BG_ALPHA":
            # 实时更新背景透明度
            global BG_ALPHA
            BG_ALPHA = value / 100.0
            # 这里可以添加实时更新UI的代码
        elif setting_key == "VOICE_ENABLED":
            s.add_user_message("系统", f"● 语音功能已{'启用' if value else '禁用'}")
        elif setting_key == "DEBUG":
            s.add_user_message("系统", f"● 调试模式已{'启用' if value else '禁用'}")
        
        # 发送设置变化信号给其他组件
        # 这里可以根据需要添加更多处理逻辑

    def set_window_background_alpha(s, alpha):
        """设置整个窗口的背景透明度
        Args:
            alpha: 透明度值，可以是:
                   - 0-255的整数 (PyQt原生格式)
                   - 0.0-1.0的浮点数 (百分比格式)
        """
        global WINDOW_BG_ALPHA
        
        # 处理不同格式的输入
        if isinstance(alpha, float) and 0.0 <= alpha <= 1.0:
            # 浮点数格式：0.0-1.0 转换为 0-255
            WINDOW_BG_ALPHA = int(alpha * 255)
        elif isinstance(alpha, int) and 0 <= alpha <= 255:
            # 整数格式：0-255
            WINDOW_BG_ALPHA = alpha
        else:
            print(f"警告：无效的透明度值 {alpha}，应为0-255的整数或0.0-1.0的浮点数")
            return
        
        # 更新CSS样式表
        s.setStyleSheet(f"""
            ChatWindow {{
                background: rgba(15, 25, 45, {WINDOW_BG_ALPHA});
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 30);
            }}
        """)
    
        # 触发重绘
        s.update()
        
        print(f"✅ 窗口背景透明度已设置为: {WINDOW_BG_ALPHA}/255 ({WINDOW_BG_ALPHA/255*100:.1f}%不透明度)")
    
    def on_thinking_requested(s):
        """处理思考请求"""
        try:
            if s.naga and s.naga.emotional_ai:
                # 触发AI主动思考
                message = s.naga.emotional_ai.generate_proactive_message()
                s.add_user_message(config.emotional_ai.ai_name, f"[主动思考] {message}")
        except Exception as e:
            print(f"处理思考请求失败: {e}")
    
    def on_search_requested(s, query: str):
        """处理搜索请求"""
        try:
            if not query:
                query = "有趣的科学知识"
            s.add_user_message(config.emotional_ai.ai_name, f"[自动搜索] 我想了解关于 '{query}' 的知识...")
        except Exception as e:
            print(f"处理搜索请求失败: {e}")
    
    def on_ai_proactive_message(s, message: str):
        """处理AI主动消息"""
        print(f"🎯 on_ai_proactive_message 被调用: {message[:50]}...")  # 添加调试信息
        try:
            # 确保在主线程中更新UI
            from PyQt5.QtCore import QTimer
            
            def update_ui():
                try:
                    print(f"🔄 执行UI更新: {message[:30]}...")  # 添加调试信息
                    
                    # 检查UI组件状态
                    print(f"🔍 UI状态检查:")
                    print(f"  - s.text存在: {hasattr(s, 'text')}")
                    print(f"  - s.text类型: {type(s.text) if hasattr(s, 'text') else 'None'}")
                    
                    ai_name = getattr(config.emotional_ai, 'ai_name', 'StarryNight')
                    
                    # 尝试最直接的方法：直接向text widget添加内容
                    print(f"🔄 尝试直接text.append...")
                    s.add_user_message(ai_name, message)
                    s.text.ensureCursorVisible()
                    print(f"✅ 直接text.append成功: {message[:30]}...")
                    
                    # 然后尝试专门的AI消息显示方法
                    try:
                        print(f"🔄 尝试add_ai_message...")
                        s.add_ai_message(ai_name, message, "ai_proactive")
                        print(f"✅ add_ai_message成功: {message[:30]}...")
                    except Exception as e_ai:
                        print(f"⚠️ add_ai_message失败: {e_ai}")
                    
                except Exception as e:
                    print(f"❌ UI更新完全失败: {e}")
                    import traceback
                    traceback.print_exc()
                    
                    # 最终备用方案
                    try:
                        print(f"🔄 尝试最终备用方案...")
                        if hasattr(s, 'text'):
                            s.text.append(f"❗ AI消息显示异常: {message[:50]}...")
                            print(f"✅ 异常消息显示成功")
                    except Exception as final_e:
                        print(f"❌ 最终备用方案也失败: {final_e}")
            
            # 在主线程中执行UI更新
            QTimer.singleShot(0, update_ui)
            print(f"📋 QTimer.singleShot 已调用")
            
        except Exception as e:
            print(f"❌ 处理AI主动消息失败: {e}")
            import traceback
            traceback.print_exc()

    def showEvent(s, event):
        """窗口显示事件"""
        super().showEvent(event)
        
        # 其他初始化代码...
        s.setFocus()
        s.input.setFocus()
        if not getattr(s, '_img_inited', False):
            if hasattr(s, 'img'):
                s.img.resize(s.img.parent().width(), s.img.parent().height())
                p = os.path.join(os.path.dirname(__file__), 'standby.png')
                q = QPixmap(p)
                if os.path.exists(p) and not q.isNull():
                    s.img.setPixmap(q.scaled(s.img.width(), s.img.height(), Qt.KeepAspectRatioByExpanding, Qt.SmoothTransformation))
            s._img_inited = True

if __name__=="__main__":
    app = QApplication(sys.argv)
    win = ChatWindow()
    win.show()
    sys.exit(app.exec_())
