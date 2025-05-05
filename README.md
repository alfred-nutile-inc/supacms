# JSON Form Builder with Supabase

This idea goes back 8 years ago for me! https://github.com/alnutile/webforms

Recently, I started building a simple editor to let users add content directly to their tables. That’s when I realized: why not leverage a structured JSON approach? With this idea, we can store a JSON configuration that represents both the form and its data. When a user visits a page in the UI, the app reads this JSON to render the appropriate form and interact with the underlying tables.

The goal is to create a user-friendly interface for managing any table in your Supabase database. While Supabase is already quite approachable, things like file uploads and handling relationships can get tricky. This project aims to simplify those advanced features, making database management even more accessible.
Ultimately, this interface becomes just one way to interact with your data. You can use it here, automate workflows with n8n, or push content out to a static site. The possibilities are wide open—making your data more flexible and your workflow more efficient.