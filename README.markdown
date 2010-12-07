Before Effects
==============

BeforeEffects is a collection of useful extensions/methods to the built-in
JavaScript Object Model as well as to available Objects provided by the After
Effects Object Model within ExtendScript. The goal is to speed up script
production for After Effects by providing helper methods that improve the way
you access the After Effects Object Model.

Why "Before Effects"?
=====================

The name "Before Effects" is a play on "After Effects". Because "Before Effects"
is placed within the startup folder of After Effects, the Before Effects object
is available before your scripts even need them!

Documentation
=============

For detailed information, please take a look at the [Before Effects
Documenation][docs] within the docs folder.

BE is gentle with its extension of the built-in Objects by
checking to make sure the methods/fields that are added are not already defined.
This is helpful in that, if the standard Objects are modified by future ECMA
specifications (or the modification of Objects created by After Effects) and they
are named the same as methods/fields that BE implements, BeforeEffects will not
overwrite the pre-defined methods.  

<a href="mailto:collin.brooks@gmail.com">Collin Brooks</a>
[docs]: place/before/effects/doc/link/here Before Effects Documentation
