Integrating Tailwind & shadcn/ui in Payload Admin Without Conflicts
1. Avoid Global Tailwind Resets in Payload Admin
Payload’s admin UI has its own styles, so including Tailwind’s base reset globally will override Payload’s default theme. This is why your admin-tailwind CSS file omits @tailwind base – the Tailwind Preflight resets would otherwise “reset browser styles globally — and these can unintentionally override Payload’s core styling”
payloadcms.com
. Skipping the base layer preserves Payload’s built-in styles, but it also means some Tailwind utilities don’t behave as expected. For example, without Tailwind’s base, the default root font size remains 13px (Payload’s default) instead of 16px, and border utilities have no default border-style, causing borders not to appear unless you add border-solid manually
payloadcms.com
. These issues confirm that disabling preflight globally is correct, but we need a way to re-introduce those base styles scoped only to your custom dashboard component.
2. Scope Tailwind Base to Your Dashboard Component
The goal is to apply Tailwind’s preflight (base) only inside your <MediaSubmissionsDashboard> component, leaving the rest of the admin UI unaffected. You can achieve this by wrapping your dashboard in a container <div> with a unique class (e.g. .dashboard-tailwind or .preflight) and scoping the reset styles to that class. Using the CSS :where() selector is a clever way to do this without increasing specificity
dev.to
. Essentially, you’ll copy Tailwind’s preflight rules and prepend your container class to each rule. For example, you can include a CSS snippet like the following in your admin CSS:
/* Scoped Tailwind Preflight for the dashboard component */
.dashboard-tailwind, :where(.dashboard-tailwind) {
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --border-color: rgb(209 213 219); /* default border (slate-300) */
  /* ... other CSS variables from Tailwind base ... */
}
.dashboard-tailwind *,:where(.dashboard-tailwind)::before,:where(.dashboard-tailwind)::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: var(--border-color);
}
/* Reset typography and element defaults within the container */
.dashboard-tailwind h1, .dashboard-tailwind h2, .dashboard-tailwind h3, .dashboard-tailwind h4, .dashboard-tailwind h5, .dashboard-tailwind h6 {
  font-size: inherit;
  font-weight: inherit;
  margin: 0;
}
.dashboard-tailwind p, .dashboard-tailwind figure, .dashboard-tailwind blockquote, .dashboard-tailwind dl, .dashboard-tailwind ol, .dashboard-tailwind ul {
  margin: 0;
}
/* ... (include other Tailwind base rules scoped to .dashboard-tailwind) ... */
This is based on the approach described by the community, which wraps Tailwind’s preflight rules in a parent selector. Using a :where(.preflight) (or your chosen class) selector removes the resets from the global namespace and “tailor[s] it to only reset the portions of a web application that we want complete control over”
dev.to
. In the example above, only elements inside <div class="dashboard-tailwind">...</div> will receive the normalized styles. For instance, all elements in that container will use border-box sizing and have no default margin, but elements elsewhere in the Payload admin remain unchanged. The snippet shows how the universal selectors are scoped to .dashboard-tailwind
dev.to
. With this in place, you can safely enable Tailwind’s base for that component only. Practically, you would:
Add the wrapper div.dashboard-tailwind around your dashboard’s JSX (which you already partly do with .hapa-dashboard-container).
In your admin CSS (perhaps in admin-tailwind.css or a new file imported in the admin), include the scoped preflight CSS as shown above. You can obtain Tailwind’s preflight rules from the Tailwind source or community snippet and prefix them with your container class. (Tip: the Dev.to article by Jason Shimkoski provides a ready-made Tailwind v3 preflight scoped to a .preflight class, which you can adapt
dev.to
dev.to
.)
Make sure your Tailwind config doesn’t inject global preflight. In your case, you’ve effectively done this by commenting out @tailwind base, but you could also set corePlugins: { preflight: false } as a safety net. Now, Tailwind’s base resets will apply only inside .dashboard-tailwind and no longer conflict with Payload’s styling.
Once this is done, Tailwind utilities inside the dashboard will behave correctly. For example, a <Card className="border"> from shadcn will now render with a visible border (since .dashboard-tailwind * has border-style: solid by default), and text sizing will be normalized to 16px base (making Tailwind’s text-sm, text-lg etc. consistent). You won’t need the brute-force reset you used earlier. Currently, your custom CSS uses .hapa-dashboard-container { all: initial; ... } to wipe out inherited styles
GitHub
 – that approach forces you to redefine every style from scratch. After scoping Tailwind’s base, you can remove the all: initial hack and let Tailwind’s own normalization take over within the component.
3. Integrate shadcn/ui with Payload’s Styles
Shadcn/UI components are built on Tailwind, so once Tailwind is working in your admin, using these components becomes much easier. There are a few key steps to ensure they blend seamlessly with Payload’s theme:
Define design tokens as CSS variables: You’ve already done this in your custom.scss – great work. The official guide suggests copying the generated CSS variables (colors, radius, etc.) into your admin CSS
payloadcms.com
payloadcms.com
. In your file, under @layer payload-default, you set all the necessary CSS variables on :root
GitHub
. This global definition is important because some shadcn components render in React portals (outside your component tree), and they will still need these variables. For example, you have:
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  /* ...other shadcn theme variables... */
}
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides ... */
}
This ensures shadcn components use the correct light/dark colors (e.g. bg-card will refer to a white in light mode and a dark gray in dark mode, as defined by these CSS variables).
Match Tailwind to Payload’s dark mode: Payload toggles a data-theme="dark" attribute on the admin root for dark mode. You’ve configured Tailwind accordingly with darkMode: ['selector', '[data-theme="dark"]', '.dark']
GitHub
. This allows Tailwind’s dark: variant to respond to Payload’s theme attribute. For example, shadcn’s components or your own classes like dark:bg-gray-800 will activate when the admin is in dark mode (rather than relying on the media-prefers-color-scheme). Keep this setting, as it’s required for dark mode support in admin.
Use Tailwind theme extension for consistency: You extended Tailwind’s theme to use the same CSS variables, which is excellent. In your tailwind.config.mjs, colors like background, foreground, card, etc., are mapped to the CSS variables you set
GitHub
. This means you can use utility classes that correspond to Payload’s palette. For instance, bg-background will use --background (white) and text-foreground will use --foreground (near-black), matching the admin’s base colors. You also defined primary, secondary, etc., so classes like bg-primary or text-secondary-foreground will reflect your HAPA brand colors. This approach preserves Payload’s theme while using Tailwind utilities – you’re no longer writing raw hex colors in CSS, but using semantic classes tied to the theme.
Check component-specific styles: Some shadcn components might require additional styles or variants. From your imports (e.g. <Tabs>, <Select>, <DropdownMenu>), it looks like you have all the necessary base styles from shadcn. Just ensure that any component that uses portals (like <Tooltip> or <Modal>) has access to the CSS vars (which it does, thanks to the global :root vars). If a component appears unstyled, verify that its styles are included or import the relevant SCSS/CSS from shadcn (the @/components/ui/* should include their styling via Tailwind classes).
4. Replace Custom CSS with Tailwind Utilities
With scoped Tailwind and shadcn in place, you can refactor the 900+ lines of custom CSS into more maintainable utility classes and component usage:
Remove manual resets and container styling: As noted, you can drop the .hapa-dashboard-container { all: initial; ... } rule
GitHub
 once Tailwind’s scoped base is active. The container can instead just have a class (like dashboard-tailwind) that triggers the scoped preflight. Basic styles like font-family, base font-size, and background gradient can be applied with Tailwind classes or minimal CSS. For example, instead of background: linear-gradient(...) in CSS, you could apply a Tailwind utility or a small custom class if needed. The key is that you won’t need !important overrides or resetting every element – Tailwind’s base handles that in your scope.
Use Tailwind for layout: Many of your custom classes (prefix hapa-) implement layout that Tailwind can do out-of-the-box. For instance, .hapa-grid-5 creates a responsive 5-column grid
GitHub
. You can replace:
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"> ... </div>
This single Tailwind line covers the same as your custom CSS for .hapa-grid-5. Similarly, classes like .hapa-grid-2 or .hapa-grid-3 can be translated to appropriate grid-cols-* utilities with responsive prefixes.
Leverage shadcn/UI components: Where you created custom card, badge, or button styles, see if shadcn components can be used. For example, you manually styled .hapa-card (with border, shadow, padding)
GitHub
 and .hapa-badge
GitHub
. The shadcn library provides <Card>, <Badge>, <Button> components that come with a baseline style using Tailwind classes. You already import <Card, CardHeader, CardContent, CardTitle> at the top of your dashboard component. Rather than using a <div className="hapa-card ...">, use the <Card> component and put <CardHeader> and <CardContent> inside. For example:
<Card className="bg-card border border-border shadow"> 
  <CardHeader><CardTitle>Total des soumissions</CardTitle></CardHeader>
  <CardContent>...content...</CardContent>
</Card>
This uses classes like bg-card and border-border which correspond to your theme variables
GitHub
. It achieves the same look as your custom .hapa-card (white background, gray border, slight shadow) but through Tailwind classes. Likewise, replace .hapa-badge spans with the shadcn <Badge> component (or a Tailwind span with px-2 py-0.5 rounded bg-secondary text-xs, etc., using your theme colors). Using Tailwind utilities for spacing, alignment (e.g. flex items-center gap-2 instead of .hapa-flex.hapa-items-center.hapa-gap-2 in your JSX) will significantly shorten the CSS.
Maintain Payload’s look and feel: Continue to use the CSS variables and theme you’ve set to ensure consistency. For instance, you styled the admin nav and buttons in custom.scss under @layer payload (using --hapa-primary and others)
GitHub
GitHub
. Those can remain as is for now (since they apply to core Payload components outside your dashboard). Your dashboard, however, can now largely use Tailwind classes referencing the same variables. The result is a unified look: your Tailwind classes bg-primary, text-[--hapa-text] (you could even add --hapa-text as a Tailwind color) etc., will align with the rest of the admin styling. By mapping things like --hapa-primary into Tailwind (similar to how --primary is mapped), you could use bg-primary for your brand green if needed, rather than a hard-coded value.
Prevent class name conflicts: Tailwind’s utility classes generally won’t clash with Payload’s BEM-style classes, but be mindful of any generic names. For example, Tailwind has a utility class .table (for display: table) which could accidentally affect Payload tables if generated. One user noted a weird table layout issue caused by Tailwind outputting a .table class that conflicted with Payload’s table styles
payloadcms.com
. In practice, this occurred because a string “table” was picked up by Tailwind’s compiler. To avoid such conflicts, you can: (a) use a prefix for Tailwind classes (e.g. prefix all classes with tw- in your Tailwind config), or (b) simply ensure your content/config doesn’t inadvertently generate unwanted classes. Using a prefix is the safer route if you anticipate collisions – then you’d write classes like tw:grid tw:grid-cols-5 etc., and it would guarantee no overlap with Payload. This is optional, though – many Payload+Tailwind projects work without a prefix as long as you exclude problematic utilities.
By following these steps, your custom dashboard will be isolated in terms of styling. Tailwind and shadcn/ui components will operate within the scope of your component, giving you a modern UI toolkit, while Payload’s native admin styles will remain intact elsewhere. The end result should be a consistent, theme-aligned dashboard: your cards, tables, and buttons will use the same design tokens as Payload (thanks to the CSS variables and Tailwind theme extension), but you’ll have the full power of Tailwind utilities and shadcn components to build the UI faster and with far less custom CSS. Sources: The Payload team’s official guides on theming and Tailwind integration were followed for best practices
payloadcms.com
payloadcms.com
. The technique for scoping Tailwind’s reset styles comes from community advice on using the :where() selector to namespace Preflight
dev.to
dev.to
. Your implementation already incorporates the recommended CSS variables for shadcn/ui
GitHub
 and ties Tailwind’s theme to Payload’s palette
GitHub
, which is exactly how to preserve the existing look while extending it. By moving styling into Tailwind utilities and scoped resets, you’ll drastically improve maintainability (no more 900-line CSS files) and can iterate on the dashboard design with confidence that you’re not breaking the rest of the admin panel. Enjoy your modern, consistent Payload dashboard! ✅
Citations

How to customize the Payload admin panel with Tailwind CSS 4

https://payloadcms.com/posts/guides/how-to-theme-the-payload-admin-panel-with-tailwind-css-4

Tailwind for admin panel | Community Help | Payload

https://payloadcms.com/community-help/discord/tailwind-for-admin-panel

Scoping Normalized Preflight CSS - DEV Community

https://dev.to/ajscommunications/scoping-normalized-preflight-css-c29

Scoping Normalized Preflight CSS - DEV Community

https://dev.to/ajscommunications/scoping-normalized-preflight-css-c29

Scoping Normalized Preflight CSS - DEV Community

https://dev.to/ajscommunications/scoping-normalized-preflight-css-c29
GitHub
dashboard.css

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/components/admin/MediaSubmissionsDashboard/dashboard.css#L4-L12

How to setup Tailwind CSS and shadcn/ui in Payload

https://payloadcms.com/posts/guides/how-to-setup-tailwindcss-and-shadcn-ui-in-payload

How to setup Tailwind CSS and shadcn/ui in Payload

https://payloadcms.com/posts/guides/how-to-setup-tailwindcss-and-shadcn-ui-in-payload
GitHub
custom.scss

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/app/(payload)/custom.scss#L4-L12
GitHub
tailwind.config.mjs

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/tailwind.config.mjs#L26-L28
GitHub
tailwind.config.mjs

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/tailwind.config.mjs#L181-L189
GitHub
dashboard.css

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/components/admin/MediaSubmissionsDashboard/dashboard.css#L156-L165
GitHub
dashboard.css

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/components/admin/MediaSubmissionsDashboard/dashboard.css#L41-L49
GitHub
dashboard.css

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/components/admin/MediaSubmissionsDashboard/dashboard.css#L204-L210
GitHub
custom.scss

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/app/(payload)/custom.scss#L71-L80
GitHub
custom.scss

https://github.com/ahmed-abdat/hapa-app/blob/8f2e631ecd9db811bdf9de0ad99e8361f1d34bb9/src/app/(payload)/custom.scss#L81-L90

Tailwind for admin panel | Community Help | Payload

https://payloadcms.com/community-help/discord/tailwind-for-admin-panel
All Sources