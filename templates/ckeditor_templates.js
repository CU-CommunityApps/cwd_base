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
        html: '<aside class="column"><h5>Tertiary Column This is local template</h5><p>This content is an <code>&lt;aside&gt;</code>, and should be placed at the beginning of an article, to show <strong class="tutorial">related information</strong>. Nearby content will wrap around this container.</p><figure class="image"><img src="/themes/custom/cwd_cti/images/cti/sample_photo_640.jpg" alt="The Big Red Bear pauses for a photo with his adoring fans." width="480" height="480" ><figcaption>Caption</figcaption></figure></div><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi aliquam fermentum lacus, ut sagittis dui porttitor vitae.</p></aside><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi aliquam fermentum lacus, ut sagittis dui porttitor vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Sed posuere consectetur est at lobortis. Maecenas sed diam eget risus varius blandit sit amet non magna. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p><h2>Heading 2</h2><p>Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Donec ullamcorper nulla non metus auctor fringilla. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue.</p><p>Donec sed odio dui. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Nulla vitae elit libero, a pharetra augue. Donec id elit non mi porta gravida at eget metus.</p>'
    }, {
        title: "Two Column Section",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="two-col"><div><p>Column One</p></div><div><p>Column Two</p></div></div><p></p>'
    }, {
        title: "Three Column Section",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="three-col"><div><p>Column One</p></div><div><p>Column Two</p></div><div><p>Column Three</p></div></div><p></p>'
    }, {
        title: "Four Column Section",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="four-col"><div><p>Column One</p></div><div><p>Column Two</p></div><div><p>Column Three</p></div><div><p>Column Four</p></div></div><p></p>'
    }, {
        title: "Two-Image Figure with Caption",
        //image: "template2.gif",
        //description: "Description.",
        html: '<figure class="two-col margined"><img src="/themes/custom/cwd_cti/images/cti/sample_homebanner.jpg" alt="The Big Red Bear pauses for a photo with his adoring fans." width="480" height="480"><img src="/themes/custom/cwd_cti/images/cti/sample_photo_640.jpg" alt="The Big Red Bear pauses for a photo with his adoring fans." width="480" height="480"><figcaption>Figure Caption</figcaption></figure>'
    }, {
       title: "Three-Image Figure with Caption",
        //image: "template2.gif",
        //description: "Description.",
        html: '<figure class="three-col margined"><img src="/themes/custom/cwd_cti/images/cti/sample_homebanner.jpg" alt="The Big Red Bear pauses for a photo with his adoring fans." width="480" height="480"><img src="/themes/custom/cwd_cti/images/cti/sample_homebanner.jpg" alt="The Big Red Bear pauses for a photo with his adoring fans." width="480" height="480"><img src="/themes/custom/cwd_cti/images/cti/sample_photo_640.jpg" alt="The Big Red Bear pauses for a photo with his adoring fans." width="480" height="480"><figcaption>Figure Caption</figcaption></figure>'
    }, {
        title: "Blockquote with Citation Footer",
        //image: "template2.gif",
        //description: "Description.",
        html: '<blockquote><p>The <code>blockquote</code> element represents content that is quoted from another source, optionally with a citation which must be within a <code>footer</code> or <code>cite</code> element, and optionally with in-line changes such as annotations and abbreviations.</p><p>Content inside a <code>blockquote</code> other than citations and in-line changes must be quoted from another source, whose address, if it has one, may be cited in the cite attribute.</p><footer><cite><a href="http://www.w3.org/html/wg/drafts/html/master/semantics.html#the-blockquote-element">4.4.4 The blockquote element</a> - W3C Working Group, 2013</cite></footer></blockquote>'
    }, {
        title: "Panel Div",
        //image: "template2.gif",
        //description: "Description.",
        html: '<div class="panel fill"><p>Content can be wrapped in containers to create visual groupings, or to draw attention to special notes or messages. The following classes can be edited or added to this container:</p><p>Options: <code>.fill</code> <code>.heavy-top</code> <code>.heavy-left</code> <code>.no-border</code></p><p>Color Accents: <code>.accent-blue-green</code> <code>.accent-blue</code> <code>.accent-purple</code> <code>.accent-gold</code> <code>.accent-green</code> <code>.accent-blue-red</code></p><p>Indenting: <code>.indent1</code> <code>.indent2</code> <code>.indent3</code> <code>.indent4</code></p></div>'
   }]
});
