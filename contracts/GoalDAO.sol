// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ClaudeMiniSBT.sol";

/**
 * @title GoalDAO
 * @dev DAO contract for LITTLE STAR AI community to vote on goals
 */
contract GoalDAO {
    ClaudeMiniSBT public claudeMiniSBT;
    
    struct Goal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 proposedAt;
        uint256 votingDeadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        bool approved;
        mapping(address => bool) hasVoted;
        mapping(address => bool) vote; // true = yes, false = no
    }
    
    struct Proposal {
        uint256 id;
        string proposalType; // "CREATE_GOAL", "MODIFY_GOAL", "COMPLETE_GOAL"
        uint256 targetGoalId;
        string newTitle;
        string newDescription;
        address proposer;
        uint256 proposedAt;
        uint256 votingDeadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => bool) vote;
    }
    
    mapping(uint256 => Goal) public goals;
    mapping(uint256 => Proposal) public proposals;
    
    uint256 public goalCounter;
    uint256 public proposalCounter;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant QUORUM_PERCENTAGE = 30; // 30% of SBT holders must vote
    
    event GoalProposed(uint256 indexed goalId, string title, address proposer);
    event ProposalCreated(uint256 indexed proposalId, string proposalType, address proposer);
    event Voted(uint256 indexed proposalId, address voter, bool support);
    event GoalApproved(uint256 indexed goalId);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);
    
    modifier onlySBTHolder() {
        try claudeMiniSBT.getClaudeMiniByOwner(msg.sender) {
            _;
        } catch {
            revert("Must own a LITTLE STAR AI SBT to participate");
        }
    }
    
    constructor(address _claudeMiniSBT) {
        claudeMiniSBT = ClaudeMiniSBT(_claudeMiniSBT);
    }
    
    /**
     * @dev Propose a new goal
     */
    function proposeGoal(
        string memory title,
        string memory description
    ) public onlySBTHolder returns (uint256) {
        uint256 goalId = goalCounter++;
        Goal storage newGoal = goals[goalId];
        
        newGoal.id = goalId;
        newGoal.title = title;
        newGoal.description = description;
        newGoal.proposer = msg.sender;
        newGoal.proposedAt = block.timestamp;
        newGoal.votingDeadline = block.timestamp + VOTING_PERIOD;
        
        emit GoalProposed(goalId, title, msg.sender);
        
        return goalId;
    }
    
    /**
     * @dev Create a proposal to modify or complete a goal
     */
    function createProposal(
        string memory proposalType,
        uint256 targetGoalId,
        string memory newTitle,
        string memory newDescription
    ) public onlySBTHolder returns (uint256) {
        require(
            keccak256(bytes(proposalType)) == keccak256(bytes("MODIFY_GOAL")) ||
            keccak256(bytes(proposalType)) == keccak256(bytes("COMPLETE_GOAL")),
            "Invalid proposal type"
        );
        
        if (keccak256(bytes(proposalType)) == keccak256(bytes("COMPLETE_GOAL"))) {
            require(goals[targetGoalId].approved, "Goal must be approved");
        }
        
        uint256 proposalId = proposalCounter++;
        Proposal storage newProposal = proposals[proposalId];
        
        newProposal.id = proposalId;
        newProposal.proposalType = proposalType;
        newProposal.targetGoalId = targetGoalId;
        newProposal.newTitle = newTitle;
        newProposal.newDescription = newDescription;
        newProposal.proposer = msg.sender;
        newProposal.proposedAt = block.timestamp;
        newProposal.votingDeadline = block.timestamp + VOTING_PERIOD;
        
        emit ProposalCreated(proposalId, proposalType, msg.sender);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a goal
     */
    function voteOnGoal(uint256 goalId, bool support) public onlySBTHolder {
        Goal storage goal = goals[goalId];
        
        require(block.timestamp <= goal.votingDeadline, "Voting period has ended");
        require(!goal.hasVoted[msg.sender], "Already voted");
        require(!goal.executed, "Goal already executed");
        
        goal.hasVoted[msg.sender] = true;
        goal.vote[msg.sender] = support;
        
        if (support) {
            goal.yesVotes++;
        } else {
            goal.noVotes++;
        }
        
        emit Voted(goalId, msg.sender, support);
    }
    
    /**
     * @dev Vote on a proposal
     */
    function voteOnProposal(uint256 proposalId, bool support) public onlySBTHolder {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp <= proposal.votingDeadline, "Voting period has ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.vote[msg.sender] = support;
        
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        emit Voted(proposalId, msg.sender, support);
    }
    
    /**
     * @dev Execute a goal after voting period
     */
    function executeGoal(uint256 goalId) public {
        Goal storage goal = goals[goalId];
        
        require(block.timestamp > goal.votingDeadline, "Voting period not ended");
        require(!goal.executed, "Goal already executed");
        
        goal.executed = true;
        
        uint256 totalVotes = goal.yesVotes + goal.noVotes;
        uint256 totalSupply = claudeMiniSBT.totalSupply();
        
        // Check if quorum is met
        if (totalVotes >= (totalSupply * QUORUM_PERCENTAGE) / 100) {
            // Check if majority voted yes
            if (goal.yesVotes > goal.noVotes) {
                goal.approved = true;
                emit GoalApproved(goalId);
            }
        }
    }
    
    /**
     * @dev Execute a proposal after voting period
     */
    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.votingDeadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        
        uint256 totalVotes = proposal.yesVotes + proposal.noVotes;
        uint256 totalSupply = claudeMiniSBT.totalSupply();
        
        // Check if quorum is met and majority voted yes
        if (totalVotes >= (totalSupply * QUORUM_PERCENTAGE) / 100 && 
            proposal.yesVotes > proposal.noVotes) {
            
            if (keccak256(bytes(proposal.proposalType)) == keccak256(bytes("MODIFY_GOAL"))) {
                Goal storage targetGoal = goals[proposal.targetGoalId];
                targetGoal.title = proposal.newTitle;
                targetGoal.description = proposal.newDescription;
            }
            
            emit ProposalExecuted(proposalId, true);
        } else {
            emit ProposalExecuted(proposalId, false);
        }
    }
    
    /**
     * @dev Get active goals (approved and not completed)
     */
    function getActiveGoals() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active goals
        for (uint256 i = 0; i < goalCounter; i++) {
            if (goals[i].approved && goals[i].executed) {
                activeCount++;
            }
        }
        
        // Create array of active goal IDs
        uint256[] memory activeGoals = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < goalCounter; i++) {
            if (goals[i].approved && goals[i].executed) {
                activeGoals[index++] = i;
            }
        }
        
        return activeGoals;
    }
    
    /**
     * @dev Check if an address has voted on a goal
     */
    function hasVotedOnGoal(uint256 goalId, address voter) public view returns (bool) {
        return goals[goalId].hasVoted[voter];
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     */
    function hasVotedOnProposal(uint256 proposalId, address voter) public view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
} 