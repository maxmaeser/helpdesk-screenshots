Multi-tenancy in Franchise Systems Ai (FS Ai) means a single account can manage multiple franchise brands, each with fully isolated data. This is designed for franchise groups that operate more than one concept under one corporate umbrella.

### The hierarchy: Organization > Brand > Agent

The platform is structured in three layers:

1. **Organization**: the top-level account. It manages billing, team membership, and brand ownership. Think of it as your franchise group or corporate entity.
2. **Brand**: each franchise concept within the organization. Brands have their own sales pipelines, marketing audiences, operations data, portals, and settings. Data does not cross between brands.
3. **Agent**: any user on the platform. Agents belong to an organization and can be granted access to one or more brands within it, with specific permissions for each.

![Home page brand selector bar showing several distinct brands under one organization, with Lumon Fresh selected](https://raw.githubusercontent.com/maxmaeser/helpdesk-screenshots/master/what-is-multi-tenancy/brand-switcher.png)

### How data isolation works

Each brand's data is kept separate, with access controlled per brand. When you are working within a brand, you only see that brand's applicants, leads, documents, workflows, and settings.

Switching to a different brand gives you a fresh view scoped to that brand's data.

If you need to see across brands, the multi-brand selector lets you view leads, prospects, and other records from multiple brands in one combined view. See *[Multi-Brand View]* for details.

### Who can access what

Organization admins control which agents have access to which brands. An agent can:

- Be part of one organization and access several brands within it.
- Have different permission levels for different brands (for example, full access to one brand's sales pipeline but read-only access to another's marketing).

This makes it possible for a single team to work across multiple brands while keeping each brand's data secure and organized.

### Who this is for

Multi-tenancy is useful for:

- **Franchise groups** managing two or more franchise concepts (for example, a food brand and a fitness brand under the same parent company).
- **Multi-brand operators** who need a unified team but separate data and branding for each concept.
- **Growing organizations** that start with one brand and expand over time. You add new brands to your existing organization without creating a new account.

### Where to manage brands

You can see all brands linked to your organization on the **Organization** page in your settings, under the **Brands** section. Organization admins can add new brands, and agents can switch between the brands they have access to directly from the dashboard.
