// namespace
Ext.ns('taraba', 'taraba.ux');

taraba.ux.UI = {
    
}

var panel;

Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'images/save_the_fish.jpg',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {
        taraba.Main.init();
    } // onReady end
    
});

taraba.Main = {

    init : function() {
        console.log('init');
        this.backButton = new Ext.Button({
            hidden: true,
            text: 'Back',
            ui: 'back',
            handler: this.onBackButtonTap,
            scope: this
        });

        this.aboutButton = new Ext.Button({
            hidden: false,
            text: 'About',
            ui: 'about',
            handler: this.onAboutButtonTap,
            scope: this
        });

        this.title = "Save the fishes";
        var toolBarItems = [this.backButton, {xtype: 'spacer'}, this.aboutButton].concat(this.buttons || []);
        this.navigationBar = new Ext.Toolbar({
            ui: 'light',
            dock: 'top',
            title: this.title,
            items: toolBarItems
        });

        this.aboutCard = new Ext.Panel({
            id: 'aboutCard',
            fullscreen: true,
            scroll: 'vertical'
        });

        var contentBase = {
            tpl: '<div id="content-header">Species<span>Origin</span></div><tpl for=".">\
                 <div class="species"><label><strong>{species}</strong></label><span>{origin}</span></div></tpl>'
        };

        this.contentlist = new Ext.List(Ext.apply(contentBase, {
            id: 'contentList',
            fullscreen: true,
            store : null,
            layout: {
                type: 'vbox',
                padding: '5',
                align: 'left'
            }
        }));

        Ext.regModel('Content', {
            fields: [ {name: 'cat'} ] 
        });


        this.rstore = taraba.Store.get();
        this.rstore.load();
        console.log('load');
        var groupingBase = {
            tpl: '<div id="cat-header">Seafood to:</div><tpl for="."><div class="category"><strong class="{cat.cls}">{cat.name}</strong></div></tpl>',
            itemSelector: 'div.category',

            singleSelect: true,
            disclosure: {
                scope: this,
                handler: this.onListchange
            },
            store: this.rstore,
            listeners : {
                itemtap : function(view, index, item, event) {
                    var record = view.getRecord(item);
                    console.log('Tapped '+record);
                    taraba.Main.onListchange(record);
                }
            }
        };

        this.mainlist = new Ext.List(Ext.apply(groupingBase, {
            id: 'mainList',
            fullscreen: true
        }));

//        var appBase = {
//            id: 'mainPanel',
//            items: [this.mainlist, this.aboutCard, this.contentlist],
//            layout: 'card',
//            dockedItems: this.navigationBar,
//            listeners: {
//                scope: this
//            }
//        }

        if (!Ext.is.iOS) {
            console.log('Not iphone');
        }

        panel = new Ext.Panel({
            id: 'mainPanel',
            items: [this.mainlist, this.aboutCard, this.contentlist],
            fullscreen: true,
            flotable: true,
            width: 350,
            height: 370,
            layout: 'card',
            dockedItems: this.navigationBar,
            listeners: {
                scope: this
            }
        });

        panel.setCard(0,{});
        console.log('Init completed');
        // strange bug in sencha, can only bind after we create our panel
        // else this store becomes
        //contentlist.bindStore(store);

    },

    onListchange : function(record, btn, index) {
        taraba.Main.backButton.show();
        taraba.Main.rstore.read();

        var category = record.get('cat');
        console.log('Disclose more info for: ' + category.name);

        taraba.Main.contentlist.update(category.items);
        taraba.Main.navigationBar.setTitle(category.name);
        panel.setCard(2,{type: 'slide', direction: 'left'});

    },

    onBackButtonTap : function() {
        this.backButton.hide();
        console.log('Back');
        panel.setCard(0,{type: 'slide', direction: 'left'});
        taraba.Main.navigationBar.setTitle(taraba.Main.title);
        console.log('done');
    },

    onAboutButtonTap : function() {
        this.backButton.show();

        var makeAjaxRequest = function() {
            Ext.Ajax.request({
                url: 'content/about.json',
                success: function(response, opts) {
                    Ext.getCmp('aboutCard').update(response.responseText);
                    panel.setCard(1,{type: 'slide', direction: 'left'});
                    console.log('Got About');
                }
            })
        };
        makeAjaxRequest();
    }

}

taraba.Store = {

    get : function() {

        var proxy = new Ext.data.AjaxProxy({
            type: 'ajax',
            url: 'content/data.json',
            reader: {
                type: 'json',
                root: 'data'
            }
        });

        var rstore = new Ext.data.JsonStore({
            storeId: "content",
            autoDestroy: true,
            model: 'Content',
            proxy: proxy,
            root: 'data'
        });

        rstore.on('load', function (store, options) {
            //console.log('Count: '+store.getCount());
        });

        proxy.on('exception', function (proxy, response, operation) {
            alert('Exception: '+response.responseText);
            console.log('Exception: '+response);
        });

        return rstore;
    }

}

taraba.About = {
    
}