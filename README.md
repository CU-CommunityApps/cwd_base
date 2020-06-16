[![Latest Stable Version](https://poser.pugx.org/cubear/cwd_base/v/stable)](https://packagist.org/packages/cubear/cwd_base)
[![Latest Unstable Version](https://poser.pugx.org/cubear/cwd_base/v/unstable)](https://packagist.org/packages/cubear/cwd_base)

 # cwd_base

Included with https://github.com/CU-CommunityApps/CD-demo
...along with https://github.com/CU-CommunityApps/cwd_project

**See also:** https://github.com/CU-CommunityApps/cwd_framework

**See also:** SASS instructions over here: https://github.com/CU-CommunityApps/cwd_base_bootstrap

NOTE: When using with a site created from [CD Demo](https://github.com/CU-CommunityApps/CD-demo), it's recommended to change the version constraint to exact version you're using when you get to site launch (or during development, if you prefer), so that the base theme doesn't get automatically updated with other packages.  (You can always update it "manually" by increasing the version constraint when you wish.)

## Misc notes (to organize "later")

### Template overrides hint:
Original/Source templates have all sorts of variable info and other details.  For example, let's say you have a template called field--field-slider-media.html.twig -- that's a template specifically for field_slider_media.  If you want to find the original/source template that's being overridden by this template, look in the template docblock for notes like:
`override field.html.twig`
and/or
`@see field.html.twig`
^^ So, look for a template called field.html.twig to find out about variables and other details available to you in this specific field template.

**Where to look?**  Surprise: It depends!  Some places to look: core/themes/stable/templates, core/modules/MODULENAME/templates, modules/contrib/MODULENAME/templates

If the template you're looking at doesn't have the aforementioned notes (or a docblock at all), it's trickier to figure out.  If you're in a dev environment with [twig_debug enabled](https://www.drupal.org/docs/8/theming/twig/debugging-twig-templates#s-enable-debugging), you may find some clues in by viewing the page source -- look for HTML comments like this:
```
<!-- THEME DEBUG -->
<!-- THEME HOOK: 'field' -->
<!-- FILE NAME SUGGESTIONS:
   * field--node--title--page.html.twig
   x field--node--title.html.twig
   * field--node--page.html.twig
   * field--title.html.twig
   * field--string.html.twig
   * field.html.twig
-->
<!-- BEGIN OUTPUT from 'themes/custom/cwd_base/templates/field--node--title.html.twig' -->
```
^^ The "file name suggestions" are listed from [most specific to least specific](https://www.drupal.org/docs/8/theming/twig/locating-template-files-with-debugging), so, the last line of the suggestions list is the name of the "original/source" template is called -- then you can hunt around for the original version with variables, etc.
