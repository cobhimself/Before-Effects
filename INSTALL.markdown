Before Effects Installation
===========================

Before Effects (referred to as "`BE`" from this point forward) is meant to be
extremely flexible. Installation is as easy as placing the "BeforeEffects"
folder within your After Effects Startup folder. No import statements or file evaluations
need to happen within your scripts; when After Effects opens, it will run the BE
library and provide the BE Object in the global namespace.

As a developer, you only need to include the portions of `BE` that
you need. Then, when your script is ready to be released, a couple of
modifications to your import statements and `BE` can be included within your
binary scripts!

The After Effects Startup Folder
================================

In most cases, placing BE within your After Effects Startup folder is all you
will need in order to utilize BE within your scripts. 

can be used within your scripts (and the scripts of your end users) in a
couple of ways. During development, you will want to have your scripts evaluate
Before Effects in order to , You can embed the B4E code into your script through
saving your script as a jsxbin file or, you can require that end-users place
Before Effects in their After Effects Startup scripts folder.

