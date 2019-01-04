    WorkspaceToolbar = Backbone.View.extend({
        enabled: false,
        events: {
            "click a": "call"
        },
        initialize: function(a) {
            this.workspace = a.workspace;
            _.bindAll(this, "call", "reflect_properties", "run_query", "swap_axes_on_dropzones", "display_drillthrough", "clicked_cell_drillthrough_export",
                "clicked_cell_drillacross", "clicked_cell_drillthrough", "activate_buttons", "switch_to_mdx", "post_mdx_transform", "toggle_fields_action", "group_parents");
            this.workspace.bind("workspace:toolbar:render", this.translate);
            this.workspace.bind("properties:loaded", this.reflect_properties);
            this.workspace.trigger("workspace:toolbar:render", {
                workspace: this.workspace
            });
            this.workspace.bind("query:new", this.activate_buttons);
            this.workspace.bind("query:result", this.activate_buttons)
        },
        activate_buttons: function(a) {
            null !==
                a && a.data && a.data.cellset && 0 < a.data.cellset.length ? ($(a.workspace.toolbar.el).find(".button").removeClass("disabled_toolbar"), $(a.workspace.el).find("td.data").removeClass("cellhighlight").unbind("click"), $(a.workspace.el).find(".table_mode").removeClass("on")) : ($(a.workspace.toolbar.el).find(".button").addClass("disabled_toolbar").removeClass("on"), $(a.workspace.el).find(".fields_list .disabled_toolbar").removeClass("disabled_toolbar"), $(a.workspace.toolbar.el).find(".about, .new, .open, .save, .edit, .run,.auto,.non_empty,.toggle_fields,.toggle_sidebar,.switch_to_mdx, .mdx").removeClass("disabled_toolbar"));
            this.reflect_properties()
        },
        template: function() {
            var a = $("#template-workspace-toolbar").html() || "";
            return _.template(a)()
        },
        render: function() {
            $(this.el).html(this.template());
            return this
        },
        translate: function() {},
        call: function(a) {
            a.preventDefault();
            var b = a.target.hash.replace("#", "");
            if (!$(a.target).hasClass("disabled_toolbar") && this[b]) this[b](a);
            return false
        },
        reflect_properties: function() {
            var a = this.workspace.query.model.properties ? this.workspace.query.model.properties : Settings.QUERY_PROPERTIES;
            true === a["saiku.olap.query.nonempty"] &&
                $(this.el).find(".non_empty").addClass("on");
            true === a["saiku.olap.query.automatic_execution"] && $(this.el).find(".auto").addClass("on");
            true !== a["saiku.olap.query.drillthrough"] && $(this.el).find(".drillthrough, .drillthrough_export").addClass("disabled_toolbar");
            true !== a["org.saiku.query.explain"] && $(this.el).find(".explain_query").addClass("disabled_toolbar");
            true !== a["org.saiku.connection.scenario"] ? $(this.el).find(".query_scenario").addClass("disabled_toolbar") : ($(this.el).find(".query_scenario").removeClass("disabled_toolbar"),
                $(this.el).find(".drillthrough, .drillthrough_export").addClass("disabled_toolbar"));
            "true" != a["saiku.olap.query.limit"] && true !== a["saiku.olap.query.filter"] || $(this.workspace.el).find(".fields_list_header").addClass("limit");
            "undefined" !== this.workspace.query.getProperty("saiku.olap.result.formatter") && "flattened" == this.workspace.query.getProperty("saiku.olap.result.formatter") && ($(this.el).find(".group_parents").hasClass("on") || $(this.el).find(".group_parents").addClass("on"));
            0 < $(this.workspace.el).find(".workspace_results tbody.ui-selectable").length &&
                $(this.el).find(".zoom_mode").addClass("on");
            $(this.el).find(".spark_bar, .spark_line").removeClass("on");
            $(this.el).find("a.edit").removeClass("disabled_toolbar");
            "VIEW" == Settings.MODE || this.workspace.isReadOnly ? ($(this.el).find("a.edit").hide(), $(this.el).find("a.save").hide()) : ("view" == this.workspace.viewState ? $(this.el).find("a.edit").removeClass("on") : $(this.el).find("a.edit").addClass("on"), $(this.el).find("a.edit").show("normal"))
			/* 用户保存权限及*编辑按钮* BIS */
			$(this.el).find("a.save").show();
			$(this.el).find("a.edit").show();
			/* BIS */
		$(this.el).find("a.save").show();
		$(this.el).find("a.edit").show();
			},
        new_query: function(a) {
            "undefined" != typeof ga && ga("send", "event",
                "Toolbar", "New Query");
            this.workspace.switch_view_state("edit");
            this.workspace.new_query();
            return false
        },
        edit_query: function(a) {
            $(a.target).toggleClass("on");
            $(a.target).hasClass("on") ? this.workspace.switch_view_state("edit") : this.workspace.switch_view_state("view")
        },
        save_query: function(a) {
            this.workspace.query && ("undefined" != typeof this.editor && (a = this.editor.getValue(), this.workspace.query.model.mdx = a), (new SaveQuery({
                query: this.workspace.query
            })).render().open())
        },
        open_query: function(a) {
            (new OpenDialog).render().open()
        },
        run_query: function(a) {
            this.workspace.query.run(true)
        },
        automatic_execution: function(a) {
            var b = !this.workspace.query.getProperty("saiku.olap.query.automatic_execution");
            this.workspace.query.setProperty("saiku.olap.query.automatic_execution", b);
            b ? $(a.target).addClass("on") : $(a.target).removeClass("on")
        },
        toggle_fields: function(a) {
            a && $(this.el).find(".toggle_fields").toggleClass("on");
            $(this.el).find(".toggle_fields").hasClass("on") ? this.toggle_fields_action("show") : this.toggle_fields_action("hide")
        },
        toggle_fields_action: function(a,
            b) {
            "show" == a && $(".workspace_editor").is(":visible") || "hide" == a && $(".workspace_editor").is(":hidden") || (b ? ($(".workspace_editor").css("height", ""), $(".workspace_editor").is(":hidden") ? $(".workspace_editor").show() : $(".workspace_editor").hide()) : "hide" == a ? $(this.workspace.el).find(".workspace_editor").hide() : $(this.workspace.el).find(".workspace_editor").show())
        },
        about: function() {
            (new AboutModal).render().open();
            return false
        },
        toggle_sidebar: function() {
            this.workspace.toggle_sidebar()
        },
        group_parents: function(a) {
            a &&
                $(a.target).toggleClass("on");
            this.$el.find(".group_parents").hasClass("on") ? this.workspace.query.setProperty("saiku.olap.result.formatter", "flattened") : this.workspace.query.setProperty("saiku.olap.result.formatter", "flat");
            this.workspace.query.run()
			/* 编辑和撤销功能 BIS */	
            //create new object to track query
            var x = new Object;


            x = {
                groupParents : true,
                nonEmpty : false,
                dimension : false,
                measure : false, 
                add : false,
                remove : false,
                properties : []
            }

            //remove the extra entries from the trackQuery
            this.workspace.query.helper.clearExtraTrackQuery();


            //add track query entry in array
            this.workspace.query.trackQuery.push(x);
            delete x;
            this.workspace.query.trackQueryIndex = this.workspace.query.trackQuery.length;
            this.workspace.query.helper.enableDisableControlButtons();
            /* BIS */	

        },
        non_empty: function(a) {
            var b = !this.workspace.query.getProperty("saiku.olap.query.nonempty");
            this.workspace.query.helper.nonEmpty(b);
            this.workspace.query.setProperty("saiku.olap.query.nonempty", b);
            $(a.target).toggleClass("on");
            this.workspace.query.run()
        },
        swap_axis: function(a) {
            $(this.workspace.el).find(".workspace_results table").html("");
            this.workspace.query.helper.swapAxes();
            this.workspace.sync_query();
            this.workspace.query.run(true)
        },
        check_modes: function(a) {
            if ("undefined" !== typeof a && null !== a)
                if (0 < $(this.workspace.el).find(".workspace_results tbody.ui-selectable").length && $(this.workspace.el).find(".workspace_results tbody").selectable("destroy"), !$(a).hasClass("on")) $(this.workspace.el).find("td.data").removeClass("cellhighlight").unbind("click"),
                    $(this.workspace.el).find(".table_mode").removeClass("on"), this.workspace.query.run();
                else if ($(a).hasClass("drillthrough_export")) $(this.workspace.el).find("td.data").addClass("cellhighlight").unbind("click").click(this.clicked_cell_drillthrough_export), $(this.workspace.el).find(".query_scenario, .drillthrough, .zoom_mode, .drillacross").removeClass("on");
            else if ($(a).hasClass("drillthrough")) $(this.workspace.el).find("td.data").addClass("cellhighlight").unbind("click").click(this.clicked_cell_drillthrough),
                $(this.workspace.el).find(".query_scenario, .drillthrough_export, .zoom_mode, .drillacross").removeClass("on");
            else if ($(a).hasClass("query_scenario")) this.workspace.query.scenario.activate(), $(this.workspace.el).find(".drillthrough, .drillthrough_export, .zoom_mode, .drillacross").removeClass("on");
            else if ($(a).hasClass("drillacross")) $(this.workspace.el).find("td.data").addClass("cellhighlight").unbind("click").click(this.clicked_cell_drillacross), $(this.workspace.el).find(".query_scenario, .drillthrough, .drillthrough_export, .zoom_mode").removeClass("on");
            else if ($(a).hasClass("zoom_mode")) {
                var b = this;
                $(b.workspace.el).find(".workspace_results tbody").selectable({
                    filter: "td",
                    stop: function(a, d) {
                        var e = [];
                        $(b.workspace.el).find(".workspace_results").find("td.ui-selected div").each(function(a, b) {
                            var c = $(b).attr("rel");
                            c && e.push(c)
                        });
                        $(b.workspace.el).find(".workspace_results").find(".ui-selected").removeClass(".ui-selected");
                        e = _.uniq(e);
						/* 编辑和撤销功能 BIS */	

                        //create new object to track query
                        var x = new Object;
                        x = {
                            zoomIntoTable : true,
                            nonEmpty : false,
                            dimension : false,
                            measure : false, 
                            add : false,
                            remove : false,
                            properties : []
                        }

                        x.properties.push(b.workspace.query.model.mdx);
                        x.properties.push(b.workspace.query.model.queryModel.axes);
                        //remove the extra entries from the trackQuery               
                        b.workspace.query.helper.clearExtraTrackQuery();

                  /* BIS */	

                        0 < e.length && b.workspace.query.action.put("/zoomin", {
                            success: function(a, c) {
								/* 编辑和撤销功能 BIS */	
                                x.properties.push(c.queryModel.axes);
                                x.properties.push(c); 
                /* BIS */	

                                b.workspace.query.parse(c);
                                b.workspace.unblock();
                                b.workspace.sync_query();
                                Saiku.ui.unblock();
                                b.workspace.query.run()
                            },
                            data: {
                                selections: JSON.stringify(e)
                            }
                        })
						/* 编辑和撤销功能 BIS */	
                        //add track query entry in array
                        b.workspace.query.trackQuery.push(x);
                        delete x;
                        b.workspace.query.trackQueryIndex = b.workspace.query.trackQuery.length;
//console.log(b.workspace.query.trackQuery);
                        b.workspace.query.helper.enableDisableControlButtons();
                  /* BIS */	

                    }
                });
                $(this.workspace.el).find(".drillthrough, .drillthrough_export, .query_scenario, .drillacross, .about").removeClass("on")
            }
        },
        query_scenario: function(a) {
            $(a.target).toggleClass("on");
            this.check_modes($(a.target))
        },
        zoom_mode: function(a) {
            $(a.target).toggleClass("on");
            this.check_modes($(a.target))
        },
        drillacross: function(a) {
            $(a.target).toggleClass("on");
            this.check_modes($(a.target))
        },
        drillthrough: function(a) {
            $(a.target).toggleClass("on");
            this.check_modes($(a.target))
        },
        display_drillthrough: function(a, b) {
            this.workspace.table.render({
                data: b
            });
            Saiku.ui.unblock()
        },
        export_drillthrough: function(a) {
            $(a.target).toggleClass("on");
            this.check_modes($(a.target))
        },
        clicked_cell_drillacross: function(a) {
            $target = $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
            a = $target.attr("rel");
            (new DrillAcrossModal({
                workspace: this.workspace,
                title: "Drill Across",
                action: "export",
                position: a,
                query: this.workspace.query
            })).open()
        },
        clicked_cell_drillthrough_export: function(a) {
            $target =
                $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
            a = $target.attr("rel");
            (new DrillthroughModal({
                workspace: this.workspace,
                maxrows: 1E4,
                title: "Drill-Through to CSV",
                action: "export",
                position: a,
                query: this.workspace.query
            })).open()
        },
        clicked_cell_drillthrough: function(a) {
            $target = $(a.target).hasClass("data") ? $(a.target).find("div") : $(a.target);
            a = $target.attr("rel");
            (new DrillthroughModal({
                workspace: this.workspace,
                maxrows: 200,
                title: "Drill-Through",
                action: "table",
                success: this.display_drillthrough,
                position: a,
                query: this.workspace.query
            })).open()
        },
        swap_axes_on_dropzones: function(a, b) {
            this.workspace.query.parse(b);
            this.workspace.unblock();
            this.workspace.sync_query();
            Saiku.ui.unblock();
            this.workspace.unblock();
            this.workspace.sync_query();
            Saiku.ui.unblock()
        },
        show_mdx: function(a) {
            (new MDXModal({
                mdx: this.workspace.query.model.mdx
            })).render().open()
        },
        workspace_titles: function(a) {
            (new TitlesModal({
                query: this.workspace.query
            })).render().open()
        },
        export_xls: function(a) {
            void 0 != this.workspace.query.name ?
                (a = this.workspace.query.name.substring(this.workspace.query.name.lastIndexOf("/") + 1).slice(0, -5), window.location = Settings.REST_URL + this.workspace.query.url() + "/export/xls/" + this.workspace.query.getProperty("saiku.olap.result.formatter") + "?exportname\x3d" + encodeURIComponent(a) + "xls") : window.location = Settings.REST_URL + this.workspace.query.url() + "/export/xls/" + this.workspace.query.getProperty("saiku.olap.result.formatter")
        },
        export_csv: function(a) {
            void 0 != this.workspace.query.name ? (a = this.workspace.query.name.substring(this.workspace.query.name.lastIndexOf("/") +
                1).slice(0, -6), window.location = Settings.REST_URL + this.workspace.query.url() + "/export/csv/" + this.workspace.query.getProperty("saiku.olap.result.formatter") + "?exportname\x3d" + encodeURIComponent(a)) : window.location = Settings.REST_URL + this.workspace.query.url() + "/export/csv/" + this.workspace.query.getProperty("saiku.olap.result.formatter")
        },
        export_pdf: function(a) {
            void 0 != this.workspace.query.name ? (a = this.workspace.query.name.substring(this.workspace.query.name.lastIndexOf("/") + 1).slice(0, -6), window.location =
                Settings.REST_URL + this.workspace.query.url() + "/export/pdf/" + this.workspace.query.getProperty("saiku.olap.result.formatter") + "?exportname\x3d" + encodeURIComponent(a)) : window.location = Settings.REST_URL + this.workspace.query.url() + "/export/pdf/" + this.workspace.query.getProperty("saiku.olap.result.formatter")
        },
		/* Excel导出 added by BIS */
        export_excel_custom : function(a){

            //var htmldata = encodeURIComponent($('.table_wrapper').html());
			if(currentFileName == "saiku-export")
				currentFileName = this.workspace.query.model.cube.caption;

            var axes = this.workspace.query.model.queryModel.axes;
            var paramString = "";
            var axesStr = [];

            for(var tempob in axes){
                var paramStr = axes[tempob].location+":";
                for(var tempA = 0; tempA<axes[tempob].hierarchies.length;tempA++){
                    for(var tempB in axes[tempob].hierarchies[tempA].levels){
                        var level = axes[tempob].hierarchies[tempA].levels[tempB];
                        if((axes[tempob].location == "FILTER") || (level.selection.members && level.selection.members.length>0)){
                            var valArr = [];
                            for(var tempC=0;tempC<level.selection.members.length;tempC++)
                                valArr.push(level.selection.members[tempC].name);

                            paramStr += axes[tempob].hierarchies[tempA].caption+"."+level.caption+"="+valArr.join(", ")+";";
                        }                       
                    }
                }
                axesStr.push(paramStr)
            }

            paramString = axesStr[1]+"~"+axesStr[2]+"~"+axesStr[0];

            var url = "/saikuExcelExport/excelGenerator";


            data = encodeURIComponent(qData); /* 辅助格式 BIS*/

            $.get("../../plugin/saiku/api/session",function(res){

                var input = '<input type="hidden" name="htmlData" value='+data+' />'+
                            '<input type="hidden" name="filename" value="'+currentFileName+'" />'+
                            '<input type="hidden" name="username" value="'+res.username+'" />'+
                            '<input type="hidden" name="filterStr" value="'+paramString+'" />';


                $('<form method="POST" action="'+ url +'" enctype="multipart/form-data">'+input+'</form>').appendTo('body').submit().remove();               
            });      
        },
        /* added by BIS */

        conditional_format :function(a){
            //console.log(queryData);
            var self = this;
            var condStrGen = function(condArry){
                var memberArry = [];
                var columnNameArry = [];
                var measuresList = [];
                $.each(condArry,function(index,condStr){

                    if($.inArray(condStr.measure,measuresList) < 0){
                        measuresList.push(condStr.measure)
                        var str2="";
                        for(var i=0;i<condStr.child.length;i++){
                            str2 += condArry[condStr.child[i]].string+"'|#|style=\"#fff\"')"
                        }
                        if(condStr.child.length==0){
                            str2 = "'|#|style=\"#fff\"'";
                        }

                        mainFmtStr = "MEMBER [Measures].["+condStr.measure+"_cond] AS '[Measures].["+condStr.measure+"]',FORMAT_STRING = "+ condStr.string + str2 + " )";
                        columnName = "[Measures].["+condStr.measure+"_cond]";
                        memberArry.push(mainFmtStr);
                        columnNameArry.push(columnName);
                    }
                })

                return [memberArry,columnNameArry];
            }

            var onApply = function(arry){
                console.log(arry);
                conditions = arry;



                // var s_measure = $(this).find("#measure option:selected").val();
                // var cond = $(this).find("#cond option:selected").val();
                // var val = $(this).find("#val1").val();
                // var color = $(this).find("#colorval").val();
                // console.log(color)

                // if(measures_list.length > 0 && measures_list.inArray(s_measure) > -1){

                // }
                // else{
                //     measures_list.push(s_measure);

                //     formatStr = "MEMBER [Measures].["+s_measure+"1] AS '[Measures].["+s_measure+"]',FORMAT_STRING = Iif([Measures].["+s_measure+"] "+cond+" "+val+", '|#|style=\""+color+"\"', '|#|style=\"#fff\"') ";
                // }   

                // console.log(conditions)
                // console.log(getMdx.indexOf("SELECT"));
                // //getMdx = getMdx.splice(getMdx.indexOf("SELECT"),0, formatStr);
                // getMdx = getMdx.substr(0,getMdx.indexOf("SELECT")) + formatStr + getMdx.substr(getMdx.indexOf("SELECT"));

                // console.log(getMdx);

                // mid1str = getMdx.substr(getMdx.indexOf("SELECT"),getMdx.indexOf("ON COLUMNS"));
                // mid2str = mid1str.substr(0,mid1str.indexOf("}"));
                // mid3str = mid1str.substr(mid1str.indexOf("}"));


               
               

                // getMdx = getMdx.substr(0,getMdx.indexOf("SELECT"))+ mid2str + ', [Measures].[Quantity1]'+ mid3str; 
                
                // queryd.mdx = getMdx;
                // console.log(queryd);
                // query.model.type="MDX";
                // query.model.mdx = getMdx;
                // query.run(true)
                // query.model.type="QUERYMODEL";



                var measuresList = [];
                var strIndex = [];
                var formatStrs = [];
                $.each(arry,function(index,x){
                    //console.log(x);
                    var fmtStr={};
                    fmtStr.string="";
                    fmtStr.child = [];
                    fmtStr.measure = x.measure;
                    var isRepeat = $.inArray(x.measure,measuresList);
                    //console.log(measuresList);
                    //console.log(isRepeat);
                    if(isRepeat<0){
                        strIndex.push(index);
                        measuresList.push(x.measure)
                        
                    }else{
                        
                        formatStrs[strIndex[isRepeat]].child.push(index);
                    }

                    fmtStr.string = "Iif([Measures].["+x.measure+"]"+x.condition+" "+x.value+", '|#|style=\""+x.color+"\"',";
                    formatStrs.push(fmtStr);
                    
                });

                //console.log(measuresList);
                //console.log(strIndex);
                //console.log(formatStrs);

                //console.log(condStrGen(formatStrs));

                var condResult = condStrGen(formatStrs);
                console.log(condResult)
                var mdxqry = oldmdx;
                
                mid1str = mdxqry.substring(mdxqry.indexOf("SELECT"));
                //console.log(mid1str);
                mid2str = mid1str.substring(0,mid1str.indexOf("}"));
                mid3str = mid1str.substring(mid1str.indexOf("}"));
                commastr = ","
                if(condResult[1].length<1)
                    commastr = ""
                newMdxQry = mdxqry.substring(0,mdxqry.indexOf("SELECT"))+condResult[0].join(" \n")+" "+mid2str+commastr+condResult[1].join()+" "+mid3str;

                console.log(newMdxQry)

                self.workspace.query.model.type= "MDX";
                self.workspace.query.model.mdx = newMdxQry;
                self.workspace.query.run(true)


                self.workspace.query.model.mdx =  oldmdx;
                self.workspace.query.model.queryModel = oldqueryModel;
                self.workspace.query.model.type="QUERYMODEL";

                //console.log(self.workspace.query);
            }
            var model = this.workspace.query.model;
            if(model.type=="QUERYMODEL"){
                oldmdx = model.mdx;
                oldqueryModel = model.queryModel;
            }

            //console.log(this.workspace.query.model)
            this.workspace.query.model.type="MDX";
            condFormatDialog(queryData,this.workspace.query,onApply);
            
            //var getMdx = "WITH SET [~ROWS] AS {[Customers].[Customer].Members} MEMBER [Measures].[Quantity1] AS '[Measures].[Quantity]',FORMAT_STRING = Iif([Measures].[Quantity] > 1000, '|#|style=\"#19b326\"', '|#|style=\"#fff\"') SELECT NON EMPTY {[Measures].[Quantity],[Measures].[Quantity1]} ON COLUMNS, NON EMPTY [~ROWS] ON ROWS FROM [SteelWheelsSales]";
            
            //var getMdx = "WITH SET [~ROWS] AS {[Customers].[Customer].Members} MEMBER [Measures].[Quantity1] AS '[Measures].[Quantity]',FORMAT_STRING = Iif([Measures].[Quantity] > 1000, '|#|style=\"#19b326\"', '|#|style=\"#fff\"') SELECT NON EMPTY {[Measures].[Quantity],[Measures].[Quantity1]} ON COLUMNS, NON EMPTY [~ROWS] ON ROWS FROM [SteelWheelsSales]";
            //console.log("asdasdasdas");
            //this.workspace.query.model.mdx = getMdx;
            //this.workspace.query.model.type= "MDX";
            //this.workspace.query.model.mdx = getMdx;

            //console.log(this.workspace.query.model);
        },
        switch_queryModel: function(a){

            var mdxqry = this.workspace.query.model.mdx;
            
            mid1str = mdxqry.substring(mdxqry.indexOf("SELECT"),mdxqry.indexOf("COLUMNS,"));
            //console.log(mid1str);
            mid2str = mid1str.substring(mid1str.indexOf("{"),mid1str.indexOf("}")+1);
            //console.log(mid2str);

            console.log(this.workspace.query.model)
            this.workspace.query.model.mdx =  oldmdx;
            this.workspace.query.model.queryModel = oldqueryModel;
            this.workspace.query.model.type="QUERYMODEL";


        },
        switch_to_mdx: function(a) {
            var b = this;
            $(this.workspace.el).find(".workspace_fields").addClass("hide");
            $(this.el).find(".auto, .query_scenario, .buckets, .non_empty, .swap_axis, .mdx, .switch_to_mdx, .zoom_mode, .drillacross").parent().hide();
            0 < $(this.workspace.el).find(".workspace_results tbody.ui-selectable").length && $(this.workspace.el).find(".workspace_results tbody").selectable("destroy");
            $(this.el).find(".run").attr("href", "#run_mdx");
            $(this.el).find(".run, .save, .open, .new, .edit").removeClass("disabled_toolbar");
            if ("view" != Settings.MODE && "table" != Settings.MODE && !this.workspace.isReadOnly) {
                $mdx_editor = $(this.workspace.el).find(".mdx_input");
                $(this.workspace.el).find(".workspace_editor .mdx_input, .workspace_editor .editor_info, .workspace_editor").removeClass("hide").show();
                this.editor = ace.edit("mdx_editor");
                this.editor.setShowPrintMargin(false);
                this.editor.setFontSize(11);
                this.editor.commands.addCommand({
                    name: "runmdx",
                    bindKey: {
                        win: "Ctrl-Enter",
                        mac: "Command-Enter"
                    },
                    exec: function(a) {
                        b.run_mdx()
                    },
                    readOnly: true
                });
                a = function() {
                    var a = b.editor.getCursorPosition();
                    $mdx_editor.parent().find(".editor_info").html("\x26nbsp; " + (a.row + 1) + ", " + a.column)
                };
                this.editor.on("changeSelection", a);
                a();
                var c = function() {
                    var a = $(document).height() / 3,
                        a = Math.floor(a / b.editor.renderer.lineHeight),
                        a = ((b.editor.getSession().getScreenLength() > a ? a : b.editor.getSession().getScreenLength()) + 1) * b.editor.renderer.lineHeight + b.editor.renderer.scrollBar.getWidth();
                    $mdx_editor.height(a.toString() + "px");
                    b.editor.resize();
                    b.workspace.adjust()
                };
                a = function() {
                    var a = b.editor.session;
                    b.editor.resize();
                    a.setUseWrapMode(true);
                    if (a.getUseWrapMode()) {
                        var c = b.editor.renderer.characterWidth,
                            f = b.editor.renderer.scroller.clientWidth;
                        0 < f && a.setWrapLimitRange(null, parseInt(f / c, 10))
                    }
                };
                a();
                c();
                b.editor.focus();
                b.editor.clearSelection();
                b.editor.getSession().setValue("");
                b.editor.getSession().on("change", c);
                $(window).resize(a);
                b.editor.on("changeSelection", c);
                b.editor.on("focus", function(a) {
                    c();
                    return true
                });
                b.editor.on("blur", function(a) {
                    100 < $(b.workspace.el).find(".mdx_input").height() && $(b.workspace.el).find(".mdx_input").height(100);
                    b.editor.resize();
                    b.workspace.adjust();
                    return true
                });
                this.editor.getSession().setMode("ace/mode/text")
            }
            this.workspace.dimension_list && $(this.workspace.el).find(".sidebar_inner ul li a").css({
                fontWeight: "normal"
            }).parent("li").removeClass("ui-draggable ui-draggable-disabled ui-state-disabled");
            this.activate_buttons({
                workspace: this.workspace
            });
            $(this.workspace.toolbar.el).find(".run").removeClass("disabled_toolbar");
            $(this.workspace.table.el).empty();
            this.workspace.adjust();
            this.post_mdx_transform()
        },
        post_mdx_transform: function() {
            var a = this;
            "MDX" !== this.workspace.query.model.type && (this.workspace.query.model.queryModel = {}, this.workspace.query.model.type = "MDX", this.workspace.query.setProperty("saiku.olap.result.formatter", "flat"), a.workspace.query.helper.model().parameters = {});
            var b = this.workspace.query.model.mdx;
            a.editor && (a.editor.setValue(b, 0), a.editor.clearSelection(), a.editor.focus());
            $(a.el).find(".group_parents").removeClass("on");
            if (Settings.ALLOW_PARAMETERS) {
                var c = function() {
                        var b = a.editor.getValue(),
                            c = [];
                        if (b)
                            for (var f = 0, g = b.length; f < g - 1; f++)
                                if ("$" === b[f] && "{" === b[f + 1]) {
                                    for (var h = "", k = false, f = f + 2; f < g; f++)
                                        if ("}" !== b[f]) h += b[f];
                                        else {
                                            k = true;
                                            f++;
                                            break
                                        }
                                    k && h && 0 < h.length && c.push(h)
                                }
                        var l = a.workspace.query.helper.model().parameters,
                            m = {};
                        _.each(c, function(a) {
                            m[a] = l[a] ? l[a] : ""
                        });
                        a.workspace.query.helper.model().parameters =
                            m;
                        a.workspace.update_parameters()
                    },
                    b = function() {
                        _.delay(c, 1E3)
                    };
                a.editor && (a.editor.getSession().off("change", b), a.editor.getSession().on("change", b));
                a.workspace.update_parameters()
            }
        },
        run_mdx: function(a) {
            100 < $(this.workspace.el).find(".mdx_input").height() && $(this.workspace.el).find(".mdx_input").height(100);
            this.editor.resize();
            a = this.editor.getValue();
            this.workspace.query.model.mdx = a;
            this.workspace.query.run(true)
        },
        explain_query: function(a) {
            this.workspace.query.action.gett("/explain", {
                success: function(a,
                    c) {
                    var d = "\x3ctextarea style\x3d'width: " + ($("body").width() - 165) + "px;height:" + ($("body").height() - 175) + "px;'\x3e",
                        d = null !== c && null !== c.error ? d + c.error : c.cellset && 0 === c.cellset.length ? d + "Empty explain plan!" : d + c.cellset[1][0].value,
                        d = d + "\x3c/textarea\x3e";
                    Saiku.ui.unblock();
                    $.fancybox('\x3cdiv id\x3d"fancy_results" class\x3d"workspace_results" style\x3d"overflow:visible"\x3e\x3ctable\x3e\x3ctr\x3e\x3cth clas\x3d"row_header"\x3eExplain Plan\x3c/th\x3e\x3c/tr\x3e\x3ctr\x3e\x3ctd\x3e' + d + "\x3c/td\x3e\x3c/tr\x3e\x3c/table\x3e\x3c/div\x3e", {
                        autoDimensions: false,
                        autoScale: false,
                        height: $("body").height() - 100,
                        width: $("body").width() - 100,
                        transitionIn: "none",
                        transitionOut: "none"
                    })
                }
            });
            return false
        }
    }),