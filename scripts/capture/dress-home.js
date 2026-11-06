/**
 * dress-home.js: make Home look like an active work screen for walkthrough takes.
 *
 *   const { dressHome } = require('./dress-home.js');
 *   prepare: async (page) => { await gotoHome(page); await dressHome(page); }
 *
 * Home's inbox and calendar show private meetings and internal tasks, so takes
 * cannot film them. This hides both and lays a fictional copy on top: the real
 * items are cloned (same classes, so the app's own CSS styles them), their text
 * is replaced with the fake set below, and the copy sits in a fixed overlay on
 * document.body. The overlay lives outside React, so a re-render cannot revert
 * it. It removes itself as soon as the route leaves Home.
 *
 * Content is fictional and Lumon-flavored; edit FAKE to change it.
 */
const FAKE = {
  greeting: 'Welcome Back, Jordan',
  brand: 'Lumon Cafe',
  inbox: [
    { kind: 'note', title: 'Priya Shah replied to your message about the Austin opening', when: '12 minutes ago' },
    { kind: 'task', title: 'Marcus Lee assigned you a task', when: '1 hour ago', task: 'Review the Q4 marketing calendar', status: 'In Progress' },
    { kind: 'note', title: 'New applicant: Dana Whitfield applied for the Denver territory', when: '2 hours ago' },
    { kind: 'task', title: 'Elena Ruiz assigned you a task', when: '3 hours ago', task: 'Approve the grand opening flyer', status: 'Not Started' },
    { kind: 'note', title: 'Your weekly lead report for Lumon Cafe is ready', when: 'yesterday' },
    { kind: 'note', title: 'Sam Okafor completed the discovery call checklist', when: '2 days ago' },
  ],
  events: [
    { from: '9:00 AM', to: '9:30 AM', title: 'Team standup', sub: '6 guests · Google Meet', meet: true, color: '#3b82f6' },
    { from: '10:30 AM', to: '11:15 AM', title: 'Discovery call: Dana Whitfield', sub: '2 guests', meet: true, color: '#f5b83d' },
    { from: '1:00 PM', to: '1:45 PM', title: 'Denver site review', sub: '3 guests', meet: false, color: '#22a06b' },
    { from: '3:00 PM', to: '4:00 PM', title: 'Franchisee onboarding: Austin', sub: '5 guests · Google Meet', meet: true, color: '#f5b83d' },
    { from: '4:30 PM', to: '5:00 PM', title: 'Marketing sync', sub: '4 guests', meet: false, color: '#3b82f6' },
  ],
  busyDays: [1, 2, 3, 5, 8, 9, 11], // day-grid cells (0-based, Monday first) that get an event dot
};

async function dressHome(page, fake = FAKE) {
  await page.evaluate((F) => {
    const leaf = (root, pred) => [...root.querySelectorAll('*')].find((e) => e.childElementCount === 0 && pred(e.textContent.trim()));
    const inbox = document.querySelector('input[placeholder="Search inbox"]')?.closest('div.grid, div.flex')?.parentElement?.querySelector('ul');
    const today = leaf(document, (t) => t.startsWith('Today ·'));
    const panel = today?.closest('div.flex.h-full.flex-col');
    if (!inbox || !panel) throw new Error('Home layout changed: inbox list or calendar panel not found');
    const items = [...inbox.children];
    const noteT = items.find((i) => !i.querySelector('h4')), taskT = items.find((i) => i.querySelector('h4'));
    if (!noteT || !taskT) throw new Error('Home inbox: need one plain and one task item to clone');

    const overlay = (src, build) => {
      const r = src.getBoundingClientRect(), box = document.createElement('div');
      box.dataset.dressHome = '1';
      Object.assign(box.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: 1, overflow: 'hidden', pointerEvents: 'none' });
      box.appendChild(build());
      document.body.appendChild(box);
      src.style.visibility = 'hidden';
    };
    const set = (el, text) => { if (el) el.textContent = text; };

    // Inbox: plain notes and task cards, cloned from the real list.
    overlay(inbox, () => {
      const ul = inbox.cloneNode(false);
      ul.style.cssText = 'visibility:visible;height:100%;overflow:hidden';
      for (const it of F.inbox) {
        const li = (it.kind === 'task' ? taskT : noteT).cloneNode(true);
        set(li.querySelector('h3'), it.title);
        set(li.querySelector('p.whitespace-nowrap'), it.when);
        if (it.kind === 'task') {
          set(li.querySelector('h4'), it.task);
          const badges = [...li.querySelectorAll('span.text-ellipsis')];
          set(badges[0], F.brand);
          set(badges[badges.length - 1], it.status);
        } else {
          li.querySelectorAll('span.text-ellipsis').forEach((b) => b.closest('span.inline-flex')?.remove()); // drop private badges
        }
        ul.appendChild(li);
      }
      return ul;
    });

    // Calendar: same panel with event dots on busy days and a fictional day list.
    overlay(panel, () => {
      const p = panel.cloneNode(true);
      p.style.visibility = 'visible';
      const cells = [...p.querySelectorAll('.grid.grid-cols-7.gap-y-1 > div')];
      const dotT = p.querySelector('span.absolute.bottom-0.rounded-full');
      cells.forEach((c, i) => {
        c.querySelectorAll('span.absolute.bottom-0').forEach((d) => d.remove());
        if (F.busyDays.includes(i)) {
          const d = dotT ? dotT.cloneNode(true) : document.createElement('span');
          // inline size and color: the app's CSS may not ship these utility classes when no real dot is on screen
          Object.assign(d.style, { position: 'absolute', bottom: '0', width: '4px', height: '4px', borderRadius: '9999px', background: '#1f54de' });
          c.firstElementChild?.appendChild(d);
        }
      });
      const list = [...p.querySelectorAll('div')].find((d) => d.querySelector(':scope > p') && d.textContent.includes('Today ·'));
      const rows = [...list.querySelectorAll(':scope > button')];
      const rowT = rows.find((b) => b.textContent.includes('Meet')) || rows[0];
      rows.forEach((b) => b.remove());
      list.querySelectorAll(':scope > p').forEach((x, i) => { if (i > 0) x.remove(); }); // keep only the "Today" heading
      for (const ev of F.events) {
        const b = rowT.cloneNode(true), times = b.querySelectorAll('.w-20 span'), texts = b.querySelectorAll('.min-w-0.flex-1 p');
        set(times[0], ev.from); set(times[1], ev.to);
        set(texts[0], ev.title); set(texts[1], ev.sub);
        const dot = b.querySelector('span.rounded-full.shrink-0'); if (dot) dot.style.backgroundColor = ev.color;
        // the Meet chip holds an icon plus a text node, so match on own text, then hide the chip box
        const meet = [...b.querySelectorAll('*')].find((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() === 'Meet'));
        if (meet && !ev.meet) meet.style.visibility = 'hidden';
        list.appendChild(b);
      }
      return p;
    });

    // Greeting (React-owned text; set once, re-applied by the watcher below).
    const hi = leaf(document, (t) => /^Welcome Back,/i.test(t));
    const greet = () => { if (hi && hi.isConnected && hi.textContent !== F.greeting) hi.textContent = F.greeting; };
    greet();

    // Remove the overlay the moment the route leaves Home or the real list goes away.
    const timer = setInterval(() => {
      if (location.pathname !== '/' || !inbox.isConnected || !panel.isConnected) {
        document.querySelectorAll('[data-dress-home]').forEach((n) => n.remove());
        clearInterval(timer);
      } else greet();
    }, 30);
  }, fake);
}

module.exports = { dressHome, FAKE };
