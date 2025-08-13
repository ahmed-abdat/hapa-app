Customizing the Payload CMS Admin Header (v3.44.0)
Overview
Payload CMS 3.44.0 provides a flexible Admin UI that can be white-labeled and customized through configuration. Many parts of the admin interface – from navigation to fields – can be overridden with custom React components. However, replacing the top header bar (AppHeader) or the user account avatar area requires understanding the available override slots and some workarounds, since direct replacement of the entire header isn’t natively supported
payloadcms.com
github.com
. Below we outline the supported admin component override points in Payload 3.44.0, and how to leverage them (especially the avatar setting) to introduce a custom user avatar component that displays the admin’s photo/initials, name, and role, with a link to the account settings page.
Supported Admin Component Override Slots (Payload 3.44.0)
Payload defines a number of “Custom Component” slots in the config where you can swap in your own React components to alter the admin UI
payloadcms.com
payloadcms.com
. Key override points include:
admin.avatar (root config property): Controls the account avatar icon in the header. Supported values are: "gravatar" (default behavior), "default" (a generic user icon), or a custom React component to render instead
payloadcms.com
. This is the primary hook for customizing the user avatar area.
admin.components.Nav: Replace the entire left-hand navigation panel with a custom component
payloadcms.com
. This lets you fully customize side menu structure and styling.
admin.components.graphics: Provide custom brand graphics. For example, graphics.Icon overrides the small logo at the top of the nav (usually the Payload icon), and graphics.Logo overrides the login screen logo
payloadcms.com
payloadcms.com
.
admin.components.logout.Button: Override the logout button component (e.g. to customize the logout UI)
payloadcms.com
.
admin.components.header: Accepts an array of components to render above the existing top bar
payloadcms.com
. This is intended for inserting a banner or extra header, rather than replacing the default header.
admin.components.beforeLogin / afterLogin: Insert components before or after the login form (useful for custom welcome messages, graphics, etc.).
admin.components.dashboard: Override the default dashboard (home) view of the admin. By providing a custom Dashboard component, you can redesign what admins see on the main page after logging in (e.g. a custom welcome screen or analytics cards).
admin.components.routes: Define additional admin routes or views. This allows injecting entirely new pages into the admin panel (for example, a custom “Analytics” or “Reports” page) and tying them into the admin layout and navigation
github.com
.
admin.components.providers: Wrap the entire admin UI with one or more custom context providers
payloadcms.com
. This is useful for injecting global context, state or theming (e.g. a Redux provider, theme context, error boundary, etc.) that your custom components might need.
Note: Collection-specific overrides (like custom edit or list views) and field component overrides also exist, but the above list covers the root-level admin overrides relevant to layout and header customization. All custom components can be referenced in payload.config.ts by file path (with optional named export) rather than direct import, to allow Payload’s Next.js-based admin to dynamically load them
payloadcms.com
payloadcms.com
.
Overriding the User Avatar Area in the Header
To customize the top-right account area (which by default shows a gravatar circle), the official method is to supply a custom avatar component via the admin.avatar config property
payloadcms.com
. This replaces the gravatar image with your component’s output, while preserving the surrounding functionality (the avatar is wrapped in a link to /admin/account by default). Steps to implement a custom avatar:
Create a React component (e.g. components/AdminAvatar.tsx) that renders the user’s avatar image or initials, along with their name/role text. This component can use Payload’s admin hooks to get the current user info:
Use the useAuth hook to access the logged-in user object
payloadcms.com
payloadcms.com
. (Ensure your component is a Client Component by adding 'use client'; at the top, because useAuth relies on React context and cannot run in a server component
payloadcms.com
payloadcms.com
.)
The user object will contain the fields from your auth-enabled collection (e.g. name, email, role, avatar field, etc.). For example, if your Users collection has fields firstName, lastName, role, and an avatar media upload, those will be available on user.
Use the user data to display their profile picture (or if not available, fall back to an initials avatar or an icon), and display their name and role next to it in the header UI.
Configure payload.config.ts to use this component for the avatar:
ts
Copy
Edit
import { buildConfig } from 'payload';
export default buildConfig({
  // ... other config ...
  admin: {
    avatar: './components/AdminAvatar#AdminAvatar',  // path#exportName for the component
    components: {
      // (you can also use other overrides here if needed)
    }
  }
});
Here we assume AdminAvatar is a named export. On startup, Payload will include this in its import map and load it in place of the default avatar
payloadcms.com
.
Style and layout: The custom avatar component will be rendered inside the header’s account link. By default, the header expects a small inline element (just an icon). Since we want to add text, we should ensure it’s styled properly:
Wrap the image and text in a container <div> and possibly apply some CSS (via a CSS module or the global admin stylesheet) to align them (e.g. center vertically, add some left margin before the name). The admin header likely has a fixed height and padding, so your text should be kept small or use an inline style to avoid overflow.
You can target the rendered elements via CSS. For example, Payload’s default avatar has classes like gravatar-account or uses a <img> with .rounded-full. Your component could add similar classes or you can override styles in app/(payload)/custom.scss if needed
payloadcms.com
.
Example – Custom Avatar Component: Below is a simplified example of a custom avatar React component that meets the requirements. It displays the user’s profile image if available; otherwise it shows the user’s initials in a circle. It also shows the user’s full name and role, and ensures clicking anywhere in this component goes to the account page (since it’s inside the existing link).
tsx
Copy
Edit
'use client';  
import React from 'react';
import { useAuth } from 'payload/components/utilities';  // useAuth from @payloadcms/ui
import { User } from 'payload-types';  // your project’s generated types for the User collection

export const AdminAvatar: React.FC = () => {
  const { user } = useAuth<User>();
  if (!user) return null;  // in case not logged in

  const firstName = user.firstName || user.name || '';  // adapt to your field names
  const lastName = user.lastName || '';
  const role = user.role;
  const fullName = `${firstName} ${lastName}`.trim();

  // Determine avatar image URL or initials:
  let avatarUrl = '';
  if (user.avatar) {
    // If avatar is a media field:
    const media = user.avatar; 
    // Assuming avatar is either a relationship or an upload with a url:
    avatarUrl = (media as any)?.url || ''; 
  }
  // Fallback: use gravatar URL if email is present and no avatar image
  if (!avatarUrl && user.email) {
    const emailHash = /* hash user.email with MD5, or use an API util */;
    avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=50&d=mp&r=g`;
  }

  return (
    <div className="custom-avatar" style={{ display: 'flex', alignItems: 'center' }}>
      {/* Avatar image or initials circle */}
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={fullName || 'User'} 
          style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ 
            width: 32, height: 32, borderRadius: '50%', background: '#666', color: '#fff', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          { /* Initials */ }
          <span>{(firstName[0] || '').toUpperCase()}{(lastName[0] || '').toUpperCase()}</span>
        </div>
      )}
      {/* Name and role text */}
      <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>
        {fullName || user.email}{" "}
        <em style={{ color: '#888', fontStyle: 'normal' }}>({role})</em>
      </span>
    </div>
  );
};
In this component:
We use useAuth<User>() to get the current user object
payloadcms.com
. (The generic <User> is the TypeScript type for our user – not required, but helps with intellisense).
We attempt to get user.avatar. If it’s an upload field, it might be a relation object – you may need to adjust how to get the URL. In the above, we assume the avatar is a media upload with a direct url property. Adjust accordingly if your setup differs.
If no uploaded avatar URL is available, we fall back to gravatar using the user’s email (by constructing the MD5 hash and using Gravatar’s d=mp default)
GitHub
payloadcms.com
. If you prefer not to use Gravatar at all, you can skip this and use initials or a placeholder image instead. (Setting admin.avatar to 'default' in config would already prevent any Gravatar calls by using Payload’s default icon
GitHub
.)
We render an <img> or a styled <div> with initials as the avatar. Next to it, we render the user’s name and role. The entire block is inside the existing anchor, so it will be clickable to the account page (no extra code needed to handle navigation).
We’ve inlined some basic styles for brevity. In a real project, put these in a CSS/SCSS file (e.g. via custom.scss or a CSS module) and add class names instead.
After adding this component and updating the config, restart Payload. The admin UI should now show the custom avatar area: e.g. a user profile picture or initials, followed by “John Doe (Admin)”, instead of the generic gravatar icon. Clicking it still goes to /admin/account as before.
Disabling Gravatar and Using Initials/Default Avatar
By default, Payload uses Gravatar to show user avatars when no custom avatar is set. Internally, if admin.avatar is not customized, the admin UI will compute an MD5 hash of the user’s email and fetch the image from gravatar.com (with the “mystery person” silhouette as a fallback)
GitHub
GitHub
. If you wish to disable Gravatar, you have a few options:
Use a custom avatar component as shown above, and simply do not call Gravatar at all (use your own fallback like initials or a static image). This completely sidesteps gravatar.
Set admin.avatar: 'default' in your config
payloadcms.com
. This tells Payload to use its built-in default user icon (a generic user silhouette) instead of Gravatar. In the source, if the avatar setting is 'default' or if the user has no email, Payload will render the default icon component
GitHub
. This is a quick way to ensure no external calls are made for avatars.
Of course, you can also provide a custom component that still uses Gravatar but perhaps with modifications (e.g. higher resolution or different default). This is up to you – the key is that once you override the avatar, you control the logic.
In summary, to cleanly remove Gravatar, either use 'default' or supply your own component. The latter gives you the opportunity to provide a richer UI (like showing user initials or a company-specific avatar). The official docs and community recommend using a custom avatar component in tandem with the useAuth hook to achieve this
payloadcms.com
payloadcms.com
.
Workarounds for Customizing the Entire Header
As of 3.44.0, Payload does not yet provide a one-step override for the whole header bar (there is an open feature request to allow overriding the <Account> menu or wrapping link directly
github.com
). The admin.components.header config can insert content above the default header, but cannot remove or replace the default header itself
payloadcms.com
. If your goal is to completely restyle the header (beyond just the avatar region), you have a couple of workarounds:
CSS-only approach: Use CSS to hide or restyle parts of the header. For example, one could hide the original user icon and inject text via the :after content or similar. This approach is limited and can be brittle, but is simple if you just need to hide a small element (like removing the gravatar if you wanted to place a custom user menu elsewhere).
Inject a replacement header & hide the original: You can leverage the admin.components.header array to render a custom header component, and simultaneously hide the default header via CSS (display: none). One community member described this approach: add your header as the first element (it will stack above the default header), then apply a style to .app-header .account or the entire default header to hide it
payloadcms.com
. This effectively shows only your header. The downside is that you need to ensure your header replicates any needed functionality (mobile menu toggles, etc.) that might have been in the original.
DOM manipulation + Portal hack: A more advanced (but clever) solution is to use a React Portal to hijack the existing header container. For example, a community user accomplished a full header replacement by targeting the .app-header element and rendering into it:
tsx
Copy
Edit
'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HeaderView } from './HeaderView'; // your custom header component

export const ReplaceAppHeader: React.FC = () => {
  const [headerEl, setHeaderEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.querySelector('.app-header') as HTMLElement;
    if (el) {
      el.innerHTML = '';       // clear out the default header content
      setHeaderEl(el);
    }
  }, []);
  if (!headerEl) return null;
  return createPortal(<HeaderView />, headerEl);
};
Then include <ReplaceAppHeader /> via admin.components.header. This code finds the rendered header DOM node, empties it, and portals your HeaderView into that node
payloadcms.com
. The result is that your HeaderView component occupies the normal header space, exactly replacing what was there, without stacking. This approach worked for the user who shared it, though it is a bit of a hacky solution. Use with caution: future changes to Payload’s DOM structure could break this, and it runs client-side (so there might be a brief flash of the old header before it gets replaced).
In general, if you can achieve your goals by targeted overrides (avatar, graphics, etc.) and CSS, that will be more stable than a full replacement hack. The Payload team has indicated interest in making the header fully replaceable in the future
payloadcms.com
, but for now we must use these tricks for drastic header customizations. For the specific goal stated – making the account area more informative – using the avatar override with a custom component is the recommended approach, as it is supported and upgrade-safe.
Using Providers or Context (if needed)
In most cases, customizing the header/avatar doesn’t require introducing new context providers. However, Payload does allow you to inject global context via admin.components.providers
payloadcms.com
. If your custom header or avatar component needs access to some global data (for example, a theme toggle context, or data from an external auth provider), you can wrap the admin UI in a custom provider. For example, you could create MyProvider that uses React Context to supply additional info to children, and register it in the config:
ts
Copy
Edit
admin: {
  components: {
    providers: ['./components/MyProvider']
  }
}
Payload will wrap the Admin app with your provider(s) in the order listed
payloadcms.com
. Within those providers (which must be client components), you can use hooks, context, or even make use of Payload’s Local API if needed. This mechanism is more relevant for complex scenarios (e.g. integrating an error monitoring context or third-party auth context). For a simple avatar override, it’s not necessary – you can directly use useAuth as shown. But it’s good to know that this exists for broader admin customizations.
Next.js 15 Integration Considerations
Payload 3.x’s admin is built on Next.js (server components architecture). When integrating with Next.js 15, be mindful of React hydration and compatibility issues:
React Hydration Warnings: After upgrading to Next 15, some users reported a hydration mismatch warning on the admin pages (likely due to minor timing or randomness issues in the server vs client render)
reddit.com
. The warning looks like: “Hydration failed because the server-rendered HTML didn’t match the client….”. In most cases, this does not break functionality and can be suppressed. Payload provides a config flag admin.suppressHydrationWarning – set this to true to silence hydration warnings on the root <html> tag
payloadcms.com
. This essentially adds the React suppressHydrationWarning attribute to the html, which is a known fix for benign hydration differences
reddit.com
. For example:
ts
Copy
Edit
admin: { 
  suppressHydrationWarning: true, 
  avatar: MyAvatarComponent, 
  /* ... */ 
}
Use this if you encounter the hydration error message in console – it’s a common workaround in Next 13+ apps
reddit.com
reddit.com
.
Client vs Server Components: As noted earlier, ensure your custom components that use browser-only APIs or React hooks (like useAuth) are marked with 'use client' at the top
payloadcms.com
. Payload’s docs explicitly show 'use client' before using hooks like useAuth or useConfig in Admin custom components
payloadcms.com
payloadcms.com
. Failing to do so can either cause build errors or runtime issues (the component might not render at all). In our example, the AdminAvatar component includes 'use client' to satisfy this requirement.
Hydration of dynamic data: If your custom avatar component introduces any truly dynamic content (e.g. something that changes between server and client render), you might still get hydration mismatches. For instance, if you show the current time, or use Math.random() for a background color, the HTML rendered on the server will differ from the client. Avoid doing that, or wrap such usage in a client-side effect. Since useAuth data is already serialized and consistent (the user info comes from the server payload), using it is safe. Just be cautious with anything that might be nondeterministic during SSR.
Next.js 15 improvements: Next 15 improved hydration error reporting, which is helpful. If you see an error, it often lists possible causes. One known culprit outside of our control is browser extensions (e.g. Grammarly) injecting into the DOM can trigger false hydration errors
github.com
. If you’ve suppressed warnings but still see issues, try in a clean browser environment to rule that out.
Overall, Payload 3.44 + Next 15 is a supported combo – just use the tools provided (the config flag and proper client-component markings) to ensure a smooth hydration. In testing the above custom avatar on Next 15, you should see it work without warnings, as long as you follow the guidelines.
Conclusion
By leveraging Payload’s configuration API, we achieved a clearer, more informative admin header: the generic gravatar icon is replaced with a custom avatar component that shows the admin’s photo or initials and their name/role, all still linking to the account settings page for easy access. This was done using the admin.avatar override – the officially recommended method
payloadcms.com
 – combined with the useAuth hook to retrieve user data within a client-side React component. We also discussed how to disable Gravatar cleanly (either via avatar: 'default' or custom logic) and outlined workarounds for more extensive header customizations. While a one-click override of the entire header isn’t available in 3.44.0 (yet)
github.com
,
payloadcms.com
 these techniques allow us to tailor the admin UI for better UX. In practice, making the account area explicit (showing the user’s identity and role) can help administrators immediately recognize the purpose of that menu (account/profile/settings) – improving usability for admin users. The approach integrates cleanly with Payload’s admin layout, and thanks to Payload’s Next.js foundation, we can use modern React patterns to implement it. As Payload continues to evolve (watch for updates in future releases), some of the hacks may become unnecessary if new features are added – but for now, we have a solid solution. Sources:
Payload CMS Documentation – Admin Panel Customization
payloadcms.com
payloadcms.com
payloadcms.com
Payload Community Help – Custom Avatar Component and useAuth
payloadcms.com
payloadcms.com
payloadcms.com
Payload GitHub Discussions – Feature Request: Custom Account Component
github.com
Payload Community Q&A – Replacing AppHeader Tips
payloadcms.com
payloadcms.com
Payload React Hooks Doc – useAuth (client component usage)
payloadcms.com
payloadcms.com
Gravatar Integration in Payload – Default behavior and disabling
GitHub
GitHub
Next.js 15 Hydration Fix – suppressHydrationWarning usage
payloadcms.com
reddit.commake