/**
 * Take spec: _smoke-members  -- recorder self-test, NO staging writes.
 * Exercises click, page transition, wait, typing and a listbox select on the
 * Lumon Cafe Members page. Run it after changing record.js:
 *
 *   node ../record.js takes/_smoke-members.js
 */
module.exports = {
  id: '_smoke-members',
  article: 'recorder-self-test',
  surface: 'brand',
  brand: 'Lumon Cafe',
  start: (r) => r.resolve('SETTINGS_ORGANISATION'),
  ready: 'text=Members',
  steps: [
    { step: 1, label: 'Open Members', action: async (rec) => {
      await rec.click({ role: 'link', name: 'Members', exact: true }, { transition: 'page' });
      await rec.wait('text=Pending invites', 'members section load');
    } },
    { step: 2, label: 'Click the search field', action: async (rec) => {
      await rec.click({ css: 'input[placeholder^="Search by name"]' }, { cursor: 'text' });
    } },
    { step: 3, label: 'Type a name', action: async (rec) => {
      await rec.type({ css: 'input[placeholder^="Search by name"]' }, 'Harlan');
    } },
    { step: 4, label: 'Open the roles filter', action: async (rec) => {
      await rec.click({ css: 'button[aria-haspopup="listbox"]:has-text("All roles")' });
      await rec.wait('[role=option]', 'filter menu open');
    } },
    { step: 5, label: 'Choose Admin', action: async (rec) => {
      await rec.select({ role: 'option', name: /^Admin/ });
      await rec.hold(400);
    } },
  ],
};
