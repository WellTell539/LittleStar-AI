import logging
import asyncio
from typing import List, Dict, Optional, Tuple
from .extractor_ds_tri import extract_triples
from .graph import store_triples, query_graph_by_keywords, get_all_triples
from .rag_query_tri import query_knowledge, set_context
import config

logger = logging.getLogger(__name__)

class GRAGMemoryManager:
    """GRAG知识图谱记忆管理器"""
    
    def __init__(self):
        self.enabled = config.GRAG_ENABLED
        self.auto_extract = config.GRAG_AUTO_EXTRACT
        self.context_length = config.GRAG_CONTEXT_LENGTH
        self.similarity_threshold = config.GRAG_SIMILARITY_THRESHOLD
        self.recent_context = [] # 最近对话上下文
        self.extraction_cache = set() # 避免重复提取
        
        if not self.enabled:
            logger.info("GRAG记忆系统已禁用")
            return
            
        try:
            # 初始化Neo4j连接
            from .graph import graph
            logger.info("GRAG记忆系统初始化成功")
        except Exception as e:
            logger.error(f"GRAG记忆系统初始化失败: {e}")
            self.enabled = False
    
    async def add_conversation_memory(self, user_input: str, ai_response: str) -> bool:
        """添加对话记忆到知识图谱（同时更新上下文和三元组）"""
        if not self.enabled:
            return False
        try:
            # 拼接本轮内容
            conversation_text = f"用户: {user_input}\nStarryNight: {ai_response}"
            
            # 更新recent_context（限制长度）
            self.recent_context.append(conversation_text)
            if len(self.recent_context) > self.context_length:
                self.recent_context = self.recent_context[-self.context_length:]
            
            # 提取和存储三元组
            if self.auto_extract:
                # 启动异步任务，不阻塞主流程
                asyncio.create_task(self._extract_and_store_triples(conversation_text))
            return True
        except Exception as e:
            logger.error(f"添加对话记忆失败: {e}")
            return False
    
    async def _extract_and_store_triples(self, text: str) -> bool:
        """提取并存储三元组"""
        try:
            # 检查是否已处理过
            text_hash = hash(text)
            if text_hash in self.extraction_cache:
                return True
                
            # 异步提取三元组
            triples = await asyncio.to_thread(extract_triples, text)
            
            if triples:
                # 异步存储到Neo4j
                await asyncio.to_thread(store_triples, triples)
                self.extraction_cache.add(text_hash)
                logger.info(f"成功提取并存储 {len(triples)} 个三元组")
                return True
            return False
        except Exception as e:
            logger.error(f"提取三元组失败: {e}")
            return False
    
    async def query_memory(self, question: str) -> Optional[str]:
        """查询记忆"""
        if not self.enabled:
            return None
            
        try:
            # 设置查询上下文
            set_context(self.recent_context)
            
            # 异步查询
            result = await asyncio.to_thread(query_knowledge, question)
            
            if result and "未在知识图谱中找到相关信息" not in result:
                logger.info("从记忆中找到相关信息")
                return result
            return None
        except Exception as e:
            logger.error(f"查询记忆失败: {e}")
            return None
    
    async def get_relevant_memories(self, query: str, limit: int = 3) -> List[Tuple[str, str, str]]:
        """获取相关记忆"""
        if not self.enabled:
            return []
            
        try:
            # 从Neo4j查询相关三元组
            triples = await asyncio.to_thread(query_graph_by_keywords, [query])
            
            # 限制返回数量
            return triples[:limit]
        except Exception as e:
            logger.error(f"获取相关记忆失败: {e}")
            return []
    
    def get_memory_stats(self) -> Dict:
        """获取记忆统计信息"""
        if not self.enabled:
            return {"enabled": False}
            
        try:
            all_triples = get_all_triples()
            return {
                "enabled": True,
                "total_triples": len(all_triples),
                "context_length": len(self.recent_context),
                "cache_size": len(self.extraction_cache)
            }
        except Exception as e:
            logger.error(f"获取记忆统计失败: {e}")
            return {"enabled": False, "error": str(e)}
    
    async def clear_memory(self) -> bool:
        """清空记忆"""
        if not self.enabled:
            return False
            
        try:
            self.recent_context.clear()
            self.extraction_cache.clear()
            logger.info("记忆已清空")
            return True
        except Exception as e:
            logger.error(f"清空记忆失败: {e}")
            return False

# 全局记忆管理器实例
memory_manager = GRAGMemoryManager() 