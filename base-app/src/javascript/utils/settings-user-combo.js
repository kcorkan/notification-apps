Ext.define('Settings.UserComboBox', {
        extend: 'Rally.ui.combobox.ComboBox',
        alias: 'widget.settingsusercombobox',

        config: {
            editable: true,
            typeAhead: true,
            queryMode: 'remote',
            minChars: 0,
            forceSelection: true,
            selectOnFocus: true,
            emptyText: 'Search...',
            allowNoEntry: true,
            noEntryText: '-- None --',
            listConfig: {
                overflowX: 'hidden'
            },
            storeConfig: {
                autoLoad: false,
                model: 'user',
                pageSize: 10,
                remoteFilter: true,
                sorters: [
                    {
                        property: 'UserName',
                        direction: 'ASC'
                    }
                ]
            },
            displayField: 'UserName',
            valueField: 'ObjectUUID'
        },

        initComponent: function() {
            this.callParent(arguments);
            if (this.getStore()) {
                this.relayEvents(this.getStore(), ['load'], 'store');
            }
        },

        constructor: function(config) {
            if (config.value) {
                Ext.merge(config, {
                    storeConfig: {
                        filters: [
                            {
                                property: 'ObjectUUID',
                                operator: "=",
                                value: config.value
                            }
                        ]
                    }
                });
            }
            this.callParent(arguments);
        },

        beforeQuery: function(queryPlan) {
            var queryString = queryPlan.query,
                storeFilters = this.store.filters.getRange(),
                idFilter = Rally.data.wsapi.Filter.or([
                    {
                        property: 'UserName',
                        operator: 'contains',
                        value: queryString
                    },
                    {
                        property: 'DisplayName',
                        operator: 'contains',
                        value: queryString
                    },
                    {
                        property: 'FirstName',
                        operator: 'contains',
                        value: queryString
                    },
                    {
                        property: 'LastName',
                        operator: 'contains',
                        value: queryString
                    },
                    {
                        property: 'EmailAddress',
                        operator: 'contains',
                        value: queryString
                    }
                ]);

            if (queryString) {
                queryPlan.query = idFilter.toString();
            } else {
                if (storeFilters.length){
                    queryPlan.query = Rally.data.wsapi.Filter.and(storeFilters).toString();
                }
            }
            
            return this.callParent(arguments);
        }
    });
