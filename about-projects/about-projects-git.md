Projects is where you organize internal, multi-step work that isn't a sales lead or a franchisee record. Site build-outs, launch checklists, internal initiatives: anything with tasks, phases, and a timeline fits here.

Go to **Projects** in the sidebar to see your brand's project list.

### The projects table

Each row shows the project name, its status, progress (tasks completed out of the total), due date, estimated launch date, and when it was created.

![Projects table showing the project list with status, progress, and due date columns, cursor on Create Project](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/projects-table.png)

Use the search box to find a project by name.

Switch between **Table** and **Timeline** view using the toggle in the toolbar. Timeline lays every project out on a shared Gantt-style calendar so you can see overlapping work at a glance.

![Projects Timeline view showing every project as a bar on a shared Gantt-style calendar](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/projects-timeline.png)

### Creating a project

Click **Create Project** to start one. You'll choose between two starting points:

**Blank project**: an empty timeline with no preset phases. Good for one-off work. You can save it as a template later.

**From a template**: pick an existing template and its phases, tasks, and timing come pre-built. This option only appears once your brand has at least one template.

![How do you want to start modal showing Blank project and From a template options, cursor on Continue blank](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/projects-create-modal.png)

If your brand has no projects yet, the table shows an empty state with a **Create Project** button to get started.

### Working inside a project

Click a project to open its detail view.

By default you see its task list. Switch between **List** and **Timeline** layout the same way you do on the main Projects table.

![Project detail view showing the task list grouped by phase, with the List/Timeline toggle and Actions button](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-detail-tasklist.png)

Use the **Actions** button to **Add Task** or **Add Phase**. Phases group related tasks together and can be reordered.

![Actions menu open on a project's task list showing Add Task and Add Phase, cursor on Add Task](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-detail-actions-menu.png)

Click the paperclip icon to switch to the **Artifacts** view, which shows files attached to the project instead of tasks.

![Project Artifacts view showing one artifact per task with file-type badges instead of status columns](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-detail-artifacts.png)

Filter and sort the task list from the toolbar, and toggle **Show completed tasks** to include finished tasks.

### Saving and importing templates

With project write access, open the project's top-right menu and choose **Save as Template**. Enter a **Template Name**, optionally add a **Description**, and click **Save Template**.

![Project menu with Save as Template](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-save-template-menu.png)
The saved structure is available when you create another project from a template.

![Save as Template dialog with name, description, and Save Template](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-save-template-form.png)
JSON import is restricted to platform administrators. If your account has that access, the **Create Project** chooser includes **Import template JSON**. Choose a project template JSON file and click **Import**.

![Project template JSON import dialog](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-import-template.png)
The import creates a new reusable template for the brand.

![Template launch picker with its template actions menu](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-template-actions.png)
Brand admins can remove a brand-owned template from the launch picker through its three-dot menu and **Delete template**. Review the confirmation before choosing **Yes, delete**.

![Template deletion confirmation in the launch picker](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-delete-template.png)
Deleting a template also removes draft projects still being set up from it. Projects already launched from it are unaffected, and shared default templates cannot be deleted here.

### Editing phases and several tasks at once

![Phase actions menu with Rename phase and Delete phase](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-phase-actions.png)
A phase's three-dot menu offers **Rename phase** and **Delete phase**. Renaming opens a **Phase name** field and a **Save** button.

![Rename phase dialog](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-rename-phase.png)
When deleting a phase that contains tasks, choose **Move tasks to Unassigned** to keep them, or choose the option to delete the phase and its tasks, then confirm with **Delete**.

![Delete phase dialog with the keep-tasks and delete-tasks choices](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-delete-phase.png)
Select task rows with their checkboxes to show the bulk toolbar. Depending on your write access, it offers **Move to phase**, **Update status**, **Assign to**, **Visible to assigned franchisee**, **Internal eyes only**, and removal of the selected tasks.

![Selected project tasks and their bulk actions](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/about-projects/project-task-bulk.png)
Moving tasks changes their phase; the visibility actions control whether the assigned franchisee can see them.

### Where project tasks show up elsewhere

Tasks that belong to a project also appear in your personal task list on the Home page. See *[About the Home Page]* for how the Tasks tab works.
