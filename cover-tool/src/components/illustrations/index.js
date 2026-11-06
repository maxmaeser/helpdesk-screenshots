import CustomStatuses from './CustomStatuses'
import AssignLeads from './AssignLeads'
import AutoAssignment from './AutoAssignment'

export const illustrations = {
  customStatuses: {
    name: 'Custom Statuses',
    component: CustomStatuses,
    frames: {
      a: { x: 0, y: 20, w: 380, h: 175 },
      b: { x: 300, y: 0, w: 220, h: 245 },
    },
  },
  assignLeads: {
    name: 'Assign Leads',
    component: AssignLeads,
    frames: {
      a: { x: -10, y: 10, w: 420, h: 210 },
      b: { x: 300, y: 52, w: 180, h: 145 },
    },
  },
  autoAssignment: {
    name: 'Auto & Manual Assignment',
    component: AutoAssignment,
    frames: {
      a: { x: 0, y: 15, w: 140, h: 165 },
      b: { x: 120, y: 5, w: 380, h: 140 },
    },
  },
}
