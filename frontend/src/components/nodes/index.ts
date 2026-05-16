import StartNode from './StartNode';
import EndNode from './EndNode';
import MessageNode from './MessageNode';
import InputNode from './InputNode';
import IntentNode from './IntentNode';
import ConditionNode from './ConditionNode';
import SwitchNode from './SwitchNode';
import DelayNode from './DelayNode';
import ApiNode from './ApiNode';
import VariableNode from './VariableNode';
import RedirectNode from './RedirectNode';
import RandomNode from './RandomNode';
import SubflowNode from './SubflowNode';

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  messageNode: MessageNode,
  inputNode: InputNode,
  intentNode: IntentNode,
  conditionNode: ConditionNode,
  switchNode: SwitchNode,
  delayNode: DelayNode,
  apiNode: ApiNode,
  variableNode: VariableNode,
  redirectNode: RedirectNode,
  randomNode: RandomNode,
  subflowNode: SubflowNode,
};

export const NODE_PALETTE = [
  {
    category: 'Control Flow',
    nodes: [
      { type: 'startNode', label: 'Start', description: 'Flow entry point' },
      { type: 'endNode', label: 'End', description: 'Terminate flow' },
      { type: 'redirectNode', label: 'Redirect', description: 'Go to another flow' },
      { type: 'subflowNode', label: 'Sub-flow', description: 'Embed a flow as component' },
    ],
  },
  {
    category: 'Messages',
    nodes: [
      { type: 'messageNode', label: 'Message', description: 'Send a message' },
      { type: 'inputNode', label: 'User Input', description: 'Capture user text' },
    ],
  },
  {
    category: 'Logic',
    nodes: [
      { type: 'intentNode', label: 'Intent', description: 'NLP intent detection' },
      { type: 'conditionNode', label: 'Condition', description: 'If/else branching' },
      { type: 'switchNode', label: 'Switch', description: 'Multi-case routing' },
    ],
  },
  {
    category: 'Actions',
    nodes: [
      { type: 'variableNode', label: 'Variable', description: 'Set/update variable' },
      { type: 'apiNode', label: 'API Call', description: 'HTTP request' },
      { type: 'delayNode', label: 'Delay', description: 'Wait before continuing' },
    ],
  },
  {
    category: 'Advanced',
    nodes: [
      { type: 'randomNode', label: 'Random', description: 'Random path selection' },
    ],
  },
];
