//TIME 
   let timeFormat =(time) => {
    var sec_num = parseInt(time, 10); 
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours + ':' + minutes ;
} 
   
       
   
                let createTask = (array) => {

                    let content = $('<textarea>')
                        .addClass('card__content')
                        .html(array.content).hide()
                    let title = $('<div>')
                        .addClass('card__title')
                        .html(array.name)

                    let time = $('<div>')
                        .addClass('card__time')
                        .html(timeFormat(array.time));


                    $('<div>')
                        .addClass('card')
                        .append(title)
                        .attr('data-card', array.id)
                        .attr('data-time', array.time)
                        .append(content)
                        .append(time)
                        .appendTo('.list[data-list="' + array.parent + '"]');
                }

                let appTimer = null;

                let stopTimer = () => {
                    clearInterval(appTimer);
                }
           
                let runTimer = (task) => {
                    let time = $(task).attr('data-time');
                    console.log(time);
                    time = time === undefined ? 0 : time;
                    appTimer = setInterval(function() {
                        time++;
                        // $('#timerRun').text(timeFormat(time));
                        $(task).attr('data-time', time);
                        $(task).find('.card__time').text(timeFormat(time));
                    }, 1000);
                }



                function download(text) {
                    let filename =  $('#file_name').val();
                    filename += ".tasks";
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    element.setAttribute('download', filename);
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }



                var openFile = function (event) {
                    var input = event.target;
                    stopTimer();
                    var reader = new FileReader();
                    reader.onload = function () {
                        var text = reader.result;
                        let filename =input.files[0].name.split(".");
                         $('#file_name').val(filename[0]);
                     
                        //var node = document.getElementById('output');
                        //node.innerText = text;
                        loadTasks(text);
                        //console.log(reader.result.substring(0, 200));
                    };
                    reader.readAsText(input.files[0]);

                  //  let filename =  $('#file_name').val();
                };




                let loadTasks = (data) => {
                    $(".card").remove();
                    var arr = JSON.parse(data);
                    if( arr !== null){
                    for (let i = 0; i < arr.tasks.length; i++) {
                        createTask(arr.tasks[i]);
                    }
                 }
                }



                if (typeof(Storage) !== "undefined") {
                    loadTasks((localStorage.getItem("tasks") === undefined ? "{tasks :[]}" : localStorage.getItem("tasks")) );
                    let project_name = localStorage.getItem("project") === undefined ? "new_project" : localStorage.getItem("project");
                    $('#file_name').val(project_name);
                    project_name
                  } else {
                   console.log("nie ma wsparcia");
                  }
                //     var tasks =
                //       '{"tasks":[{"id":"1","name":"Zadanie","content":"test","parent":"1"},{"id":"1","name":"Zadanie","content":"test","parent":"3"}]}';



                let cardToJson = () => {

                    let json = new Object();
                    json.tasks = [];

                    $(".card").each(function () {
                        let card = new Object();
                        card.id = $(this).attr('data-card');
                        card.name = $(this).find('.card__title').text();
                        card.content = $(this).find('.card__content').val();
                        card.parent = $(this).parent().attr('data-list');
                        card.time = $(this).attr('data-time');
                        json.tasks.push(card);
                    });

                    return JSON.stringify(json);
                }

                jQuery(document).ready(function ($) {

                    jQuery.fn.extend({
                        togleWait: function () {
                            var dis = $(this).attr("disabled") === "disabled";
                            var loader = $(this).hasClass("loader");


                            if (!loader) {
                                $(this).prepend(
                                    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
                                );
                                $(this).prop("disabled", true);
                                $(this).addClass("loader");
                            } else {
                                $(this).removeClass("loader");
                                $(this).find(".spinner-border").remove();
                                $(this).removeAttr("disabled");
                            }
                        }
                    });




                    $('body').on('dblclick', '.card', function () {
                        $('body').toggleClass('darkness');
                        $(this).toggleClass('--editable');
                        $(this).hasClass('--editable') ? $(this).removeData('sortableItem') : false;
                        $(this).hasClass('--editable') ? $(this).find('.card__content').attr(
                            'contenteditable',
                            true) : $(this).find('.card__content').attr('contenteditable', false);
                        $(this).find('.card__content').toggle('fast');
                    });


                    let localSave = () => {
                        if (typeof(Storage) !== "undefined") {
                            localStorage.setItem("tasks", cardToJson());
                            let filename =  $('#file_name').val();
                            localStorage.setItem("project", filename);
                            }
                    };


                    function move_card(card) {
                        var self = $(card);
                        var id = self.attr("data-card-id");
                        var parent = self.parent().attr("data-list");
                        localSave();
                    }





                    $(".list, .--sortable").sortable({
                        connectWith: ".list, .--sortable",
                        cancel: ".--editable",
                        delay: 5,
                        items: ".card, div:not(.head, *, .--editable)",
                        start: function (event, ui){
                            $('#trash').show('fast');
                        },
                        stop: function (event, ui) {
                            // console.log(ui);
                            $('#trash').hide('fast');
                            if (ui.originalPosition != ui.position) {
                                move_card(ui.item);
                            }

                            $(ui.placeholder).css("color", "red");
                        }
                    });

                    $("body").on("click", ".card", function () {
                        //    $(this).sortable("disable");
                        $(this).attr("contenteditable", true);
                    });

                });


                $('#save').on('click', function () {
                    let data = cardToJson();
                    download( data);
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem("tasks", cardToJson());
                        }
                })

                $('#new').on('click', function () {
                    createTask({
                        'id': 1,
                        'name': "New",
                        'parent': 1,
                        'content': "Opis zadania",
                        'time' : 0
                    });
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem("tasks", cardToJson());
                        }
                })


                $('#trash').droppable({
                    over: function (event, ui) {
                        ui.draggable.addClass('toRemove');
                    },
                    out: function (event, ui) {
                        ui.draggable.removeClass('toRemove');
                    },
                    drop: function (e, ui) {
                        ui.draggable.remove();
                    }
                });



                $('#timer').droppable({
                    over: function (event, ui) {
                        ui.draggable.addClass('toRemove');
                    },
                    out: function (event, ui) {
                        ui.draggable.removeClass('toRemove');
                        stopTimer();
                    },
                    drop: function (e, ui) {
                        runTimer(ui.draggable);
                    }
                });

                // window.onbeforeunload = function(){
                //     return 'Are you sure you want to leave?';
                //   };