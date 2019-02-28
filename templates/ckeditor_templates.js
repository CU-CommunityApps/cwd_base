/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

// Register a templates definition set named "default".
CKEDITOR.addTemplates( 'default', {
    // The name of sub folder which hold the shortcut preview images of the
    // templates.
    imagesPath: CKEDITOR.getUrl( CKEDITOR.plugins.getPath( 'templates' ) + 'templates/images/' ),

    // The templates definitions.
    templates: [{
        title: "Starter Page with Tertiary Column",
        //image: "template1.gif",
        //description: "Description",
        html: '<aside class="column"><h2 class="h5">Tertiary Column</h2><p>This content is an <code>&lt;aside&gt;</code>, and should be placed at the beginning of an article, to show <strong class="tutorial">related information</strong>. Nearby content will wrap around this container.</p></div><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi aliquam fermentum lacus, ut sagittis dui porttitor vitae.</p></aside><p class="intro">This is the .intro style to give extra impact to an opening sentence or two.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi aliquam fermentum lacus, ut sagittis dui porttitor vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p><h2>Heading Level 2</h2><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Donec ullamcorper nulla non metus auctor fringilla. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.</p><h3>Heading Level 3</h3><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Donec ullamcorper nulla non metus auctor fringilla. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi aliquam fermentum lacus, ut sagittis dui porttitor vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>'
    }, {
        title: "Two Column Section",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="two-col padded"><div><p>Column One</p></div><div><p>Column Two</p></div></div><p></p>'
    }, {
        title: "Three Column Section",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="three-col padded"><div><p>Column One</p></div><div><p>Column Two</p></div><div><p>Column Three</p></div></div><p></p>'
    }, {
        title: "Four Column Section",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="four-col padded"><div><p>Column One</p></div><div><p>Column Two</p></div><div><p>Column Three</p></div><div><p>Column Four</p></div></div><p></p>'
    }, {
        title: "Blockquote with Citation Footer",
        //image: "template2.gif",
        //description: "Description.",
        html: '<blockquote><p>The <code>blockquote</code> element represents content that is quoted from another source, optionally with a citation which must be within a <code>footer</code> or <code>cite</code> element, and optionally with in-line changes such as annotations and abbreviations.</p><p>Content inside a <code>blockquote</code> other than citations and in-line changes must be quoted from another source, whose address, if it has one, may be cited in the cite attribute.</p><footer><cite><a href="http://www.w3.org/html/wg/drafts/html/master/semantics.html#the-blockquote-element">4.4.4 The blockquote element</a> - W3C Working Group, 2013</cite></footer></blockquote>'
    }, {
        title: "Panel Div",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="panel fill dialog"><p>Content can be wrapped in containers to create visual groupings, or to draw attention to special notes or messages. The following classes can be edited or added to this container:</p><p>Options: <code>.fill</code> <code>.heavy-top</code> <code>.heavy-left</code> <code>.no-border</code></p><p>Color Accents: <code>.accent-blue-green</code> <code>.accent-blue</code> <code>.accent-purple</code> <code>.accent-gold</code> <code>.accent-green</code> <code>.accent-blue-red</code></p><p>Indenting: <code>.indent1</code> <code>.indent2</code> <code>.indent3</code> <code>.indent4</code></p></div>'
   }]
});
