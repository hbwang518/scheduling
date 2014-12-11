/// <reference path="jquery-2.0.3.js" />
/// <reference path="moment.min.js" />
/// <reference path="jquery.common.js" />

var gloDate = new Date();
var gloMonth = moment(new Date());
var gloTimeFormat = "YYYY-MM-DDTHH:mm";
var gloDateFormat = "YYYY-MM-DD";
var gloStringTimeFormat = "{0}-{1}-{2} {3}";
var gloMomentFormat = "YYYY-MM-DD hh:mm";
var gloMinuteFormat = "YYYYMMDDhhmm";
var gloDateTimeFormat = "hh:mm";
var gloInitEvents = new Array();
var gloTeachers = new Array();
var gloRooms = new Array();
var gloLessons = new Array();
var gloCourses = new Array();
var gloEvent = null;
var gloCalEvent = null;
//id and object is the key and value
var gloTeacherHash = new jQuery.hashtable();
var gloRoomHash = new jQuery.hashtable();
var gloLessonHash = new jQuery.hashtable();

//id and object is the key and value
var gloCourseHash = new jQuery.hashtable();

// the selected id and obj is the key and value
var gloSelectTeacherHash = new jQuery.hashtable();
var gloSelectRoomHash = new jQuery.hashtable();
var gloSelectLessonHash = new jQuery.hashtable();

//select array
var gloTeacherColorArray = ["#ff0000", "#ffff00", "#008000", "#0000ff"];
var gloTeacherColorNameArray = ["红色", "黄色", "绿色", "蓝色"];
var gloTeacherFlagNameArray = ['雅思', '托福'];
var gloRoomColorArray = ["#ff8c00", "#7fff00", "#8b4513", "#92cd32"];
var gloRoomColorNameArray = ["橙色", "青色", "棕色", "褐色"];
var gloLessonColorArray = ["#ff8c00", "#7fff00", "#8b4513", "#92cd32"];
var gloLessonColorNameArray = ["橙色", "青色", "棕色", "褐色"];

//global relationship the id and course id array is the key and value
var gloTeacherCourseIdHash = new jQuery.hashtable();
var gloRoomCourseIdHash = new jQuery.hashtable();
var gloLessonCourseIdHash = new jQuery.hashtable();

//teacher event is that event the teacher cannot be assigned course. Teacher id and event id array is the key and value
var gloTeacherEventHash = new jQuery.hashtable();
//room event is that event the room cannot be assigned course. Room id and event id array is the key and value
var gloRoomEventHash = new jQuery.hashtable();


var gloEventBorderColor = '';
//for teacher infomation modification
var gloTeacherId = "";

$(function () {    
    setPopupPosition();
    initData()
    showCalendar();
    initMonthPicker();
    $("body").click(bodyClick);
    draggable();
    droppable();
});

function droppable() {
    $("a.courseevent").droppable(droppableParams);
}

function draggable() {
    $("span.draggable").draggable(draggableParams);
}

var draggableParams = {
    helper: "clone",
    zIndex: 200,
    cursor: "pointer",
    cancel: ".nodraggable",
    snap: true
}

var droppableParams = {
    drop: drop,
    tolerance: 'pointer'
}

function test() {
    var event = gloInitEvents[0];
    var clientEvents = $("#calendar").fullCalendar('clientEvents', event.id);
    if (clientEvents.length > 0) {
        var event = clientEvents[0];
        event.conflict = 'teacher';
        $("#calendar").fullCalendar('updateEvent', event);
    }
}

function drop(event, ui) {
    var name = ui.helper.attr("name");
    var eventId = $(this).attr("name");
    var clientEvents = $("#calendar").fullCalendar('clientEvents', eventId);
    var event = clientEvents[0];

    var oldLessonId = event.lessonId || '';    

    if (name.indexOf("teacher") == 0) {
        var teacherId = name.substr("teacher".length);
        changeTeacher(teacherId, event);
    } else if (name.indexOf("room") == 0) {
        var roomId = name.substr("room".length);
        changeRoom(roomId, event);
    } else if (name.indexOf("lesson") == 0) {
        var lessonId = name.substr("lesson".length);
        changeLesson(lessonId, event);
    }
    var lessonId = event.lessonId || '';
    if ('' != oldLessonId) { //refresh old lesson
        refreshLessonDropDiv(gloLessonHash.get(oldLessonId));
    }
    if ('' != lessonId) { //refresh new lesson
        refreshLessonDropDiv(gloLessonHash.get(lessonId));
    }
    findConflictForEvent(event)
    $("#calendar").fullCalendar('updateEvent', event);
    droppable();
}

function changeTeacher(teacherId, event) {    
    var teacherCourseArray = null;
    var course = gloCourseHash.get(event.id);
    if ('' != event.teacherId) {
        //remove course from gloTeacherCourseIdHash
        teacherCourseArray = gloTeacherCourseIdHash.get(event.teacherId);
        teacherCourseArray.remove(course.id);
    }
    
    if ('0' == teacherId) {
        event.teacherId = '';
        event.teacherColor = '';
        course.teacherId = '';
    }
    else {
        var teacher = gloTeacherHash.get(teacherId);
        event.teacherId = teacher.id;
        event.teacherColor = teacher.color;

        if (gloTeacherCourseIdHash.containsKey(teacher.id)) {
            teacherCourseArray = gloTeacherCourseIdHash.get(teacher.id);
        } else {
            teacherCourseArray = new jQuery.uniqueArray();
            gloTeacherCourseIdHash.add(teacher.id, teacherCourseArray);
        }
        course.teacherId = teacherId;
        teacherCourseArray.add(course.id);
    }
}

function changeRoom(roomId, event) {
    var roomCourseArray = null;
    var course = gloCourseHash.get(event.id);
    if ('' != event.roomId) {
        //remove course from gloRoomCourseIdHash
        roomCourseArray = gloRoomCourseIdHash.get(event.roomId);
        roomCourseArray.remove(course.id);
    }
    
    if ('0' == roomId) {
        event.roomId = '';
        event.roomColor = '';
        event.title = '';
        course.roomId = '';
    }
    else {
        var room = gloRoomHash.get(roomId);
        event.roomId = room.id;
        event.title = room.school;
        event.roomColor = room.color;

        if (gloRoomCourseIdHash.containsKey(room.id)) {
            roomCourseArray = gloRoomCourseIdHash.get(room.id);
        } else {
            roomCourseArray = new jQuery.uniqueArray();
            gloRoomCourseIdHash.add(room.id, roomCourseArray);
        }
        course.roomId = roomId;
        roomCourseArray.add(course.id);
    }
}

function schedulingRoomChange() {
    var roomId = $("#schedulingRoom").val();
    if ('0' == roomId) {
        $("#schedulingSchool").html('');
    } else {
        var room = gloRoomHash.get(roomId);
        $("#schedulingSchool").html(room.school);
    }
}

function changeLesson(lessonId, event) {
    var lessonCourseArray = null;
    var course = gloCourseHash.get(event.id);
    if ('' != event.lessonId) {
        //remove course from gloLessonCourseIdHash
        lessonCourseArray = gloLessonCourseIdHash.get(event.lessonId);
        lessonCourseArray.remove(course.id);
    }
    
    if ('0' == lessonId) {
        event.lessonId = '';
        event.lessonColor = '';
        course.lessonId = '';
    }
    else {
        var lesson = gloLessonHash.get(lessonId);
        event.lessonId = lesson.id;
        event.lessonColor = lesson.color;

        if (gloLessonCourseIdHash.containsKey(lesson.id)) {
            lessonCourseArray = gloLessonCourseIdHash.get(lesson.id);
        } else {
            lessonCourseArray = new jQuery.uniqueArray();
            gloLessonCourseIdHash.add(lesson.id, lessonCourseArray);
        }
        course.lessonId = lesson.id;
        lessonCourseArray.add(course.id);
    }
}

function findConflictForEvent(event) {
    var conflict = '';
    var teacherId = event.teacherId || '';
    var eventDay = event.day;
    var eventStart = moment(event.start).format(gloMinuteFormat).toString();
    var eventEnd = moment(event.end).format(gloMinuteFormat).toString();
    if ('' != teacherId && gloTeacherEventHash.containsKey(teacherId)) {
        var teacherEvents = gloTeacherEventHash.get(teacherId);
        for (var i = 0; i < teacherEvents.length; i++) {
            var e = teacherEvents[i];
            if (e.day != eventDay) {
                continue;
            }
            var startStr = moment(e.start).format(gloMinuteFormat).toString();
            var endStr = moment(e.end).format(gloMinuteFormat).toString();
            if ((startStr >= eventStart && startStr <= eventEnd) || (endStr >= eventStart && endStr <= eventEnd)) {
                conflict += "teacher";
                break;
            }
        }
    }

    var roomId = event.roomId || '';
    if (gloRoomEventHash.containsKey(roomId)) {
        var roomEvents = gloRoomEventHash.get(roomId);
        for (var i = 0; i < roomEvents.length; i++) {
            var e = roomEvents[i];
            if (e.day != eventDay) {
                continue;
            }
            var startStr = moment(e.start).format(gloMinuteFormat).toString();
            var endStr = moment(e.end).format(gloMinuteFormat).toString();
            if ((startStr >= eventStart && startStr <= eventEnd) || (endStr >= eventStart && endStr <= eventEnd)) {
                conflict += "room";
                break;
            }
        }
    }
    event.conflict = conflict;
}

function setScheduling() {
    var startTime = $("#setSchedulingStart").val();
    var endTime = $("#setSchedulingEnd").val();

    gloCalEvent.start = getEventTime(gloCalEvent.start.format(gloDateFormat).toString(), startTime);
    gloCalEvent.end = getEventTime(gloCalEvent.start.format(gloDateFormat).toString(), endTime);
    var oldLessonId = gloCalEvent.lessonId || '';
    var teacherId = $("#schedulingTeacher").val();
    if (teacherId != gloCalEvent.teacherId) {
        changeTeacher(teacherId, gloCalEvent);
    }

    var roomId = $("#schedulingRoom").val();
    if (roomId != gloCalEvent.roomId) {
        changeRoom(roomId, gloCalEvent);
    }
    var lessonId = $("#schedulingLesson").val();
    if (lessonId != gloCalEvent.lessonId) {
        changeLesson(lessonId, gloCalEvent);
    }

    var course = gloCourseHash.get(gloCalEvent.id);
    course.start = gloCalEvent.start;
    course.end = gloCalEvent.end;
    course.teacherId = gloCalEvent.teacherId;
    course.roomId = gloCalEvent.roomId;
    
    course.lessonId = gloCalEvent.lessonId;
    
    if ('' != $("#setSchedulingHour").val()) {
        course.hour = $("#setSchedulingHour").val();
    }
    findConflictForEvent(gloCalEvent);

    $("#calendar").fullCalendar('updateEvent', gloCalEvent);

    gloEventBorderColor = gloEvent.css('border-color');
    gloEvent.css('border-color', 'yellow');

    if ('' != oldLessonId) { //refresh old lesson
        refreshLessonDropDiv(gloLessonHash.get(oldLessonId));
    }
    if ('' != course.lessonId) { //refresh new lesson
        refreshLessonDropDiv(gloLessonHash.get(course.lessonId));
    }
    droppable();
}

function closeScheduling() {
    gloEvent.css('border-color', gloEventBorderColor);
    closePopup('schedulingSelectDiv');
}

function dayClick(date, jsEvent, view) {
    //$("#schedulingSelectDiv").css("top", jsEvent.pageY + "px");
    //$("#schedulingSelectDiv").css("left", jsEvent.pageX + "px");
    //$("#schedulingSelectDiv").show();
    //loadSchedulingElement();
    //gloEvent = $(this);
}

function eventClick(calEvent, jsEvent, view) {

    //alert('Event: ' + calEvent.title);
    //alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
    //alert('View: ' + view.name);
    if (calEvent.id.length > 0) {
        if (gloTeacherHash.containsKey(calEvent.id) || gloRoomHash.containsKey(calEvent.id)) {
            return;
        }
    }

    $("#schedulingSelectDiv").css("top", jsEvent.pageY + "px");
    $("#schedulingSelectDiv").css("left", jsEvent.pageX + "px");
    $("#schedulingSelectDiv").show();
    $(this).css('border-color', 'red');
    loadSchedulingElement();
    gloEvent = $(this);
    gloCalEvent = calEvent;

    //set dom value
    $("#setSchedulingStart").val(calEvent.start.format(gloDateTimeFormat).toString());
    $("#setSchedulingEnd").val(calEvent.end.format(gloDateTimeFormat).toString());
    $("#schedulingSchool").html(calEvent.title || '');

    var teacherId = calEvent.teacherId || '';
    if ('' != teacherId) {
        $("#schedulingTeacher").val(teacherId);
    }

    var roomId = calEvent.roomId || '';
    if ('' != roomId) {
        var room = gloRoomHash.get(roomId);
        $("#schedulingSchool").html(room.school);
        $("#schedulingRoom").val(roomId);
    }

    var lessonId = calEvent.lessonId || '';
    if ('' != lessonId) {
        $("#schedulingLesson").val(lessonId);
    }
    event.stopPropagation();
}

function loadSchedulingElement() {
    $("#schedulingTeacher :not(:first-child)").remove();
    for (var i = 0; i < gloSelectTeacherHash.keys.length; i++) {
        var teacher = gloTeacherHash.get(gloSelectTeacherHash.keys[i]);
        $("#schedulingTeacher").append('<option value="' + teacher.id + '">' + teacher.name + '</option>');
    }
    $("#schedulingTeacher").val(0);

    $("#schedulingRoom :not(:first-child)").remove();
    for (var i = 0; i < gloSelectRoomHash.keys.length; i++) {
        var room = gloRoomHash.get(gloSelectRoomHash.keys[i]);
        $("#schedulingRoom").append('<option value="' + room.id + '">' + room.name + '</option>');
    }
    $("#schedulingRoom").val(0);

    $("#schedulingLesson :not(:first-child)").remove();
    for (var i = 0; i < gloSelectLessonHash.keys.length; i++) {
        var lesson = gloLessonHash.get(gloSelectLessonHash.keys[i]);
        $("#schedulingLesson").append('<option value="' + lesson.id + '">' + lesson.name + '</option>');
    }
    $("#schedulingLesson").val(0);
}

function addTeacherSubmit() {
    var checkboxs = $("#teacherTable").find("input[type=checkbox]:checked");
    $(checkboxs).each(function (index, element) {
        var teacher = gloTeacherHash.get($(this).val());
        teacher.flag = $("#teacherTable").find('select[name=' + $(this).val() + ']').val();
        teacher.content = $("#teacherTable").find('input[name=' + $(this).val() + ']').val();
        addTeacher(teacher);
    });
    $("#teacherListDiv span.draggable").draggable(draggableParams);
}

function addTeacher(teacher) {
    teacher.color = getColorForTeacher();
    addTeacherToDom(teacher);
    gloSelectTeacherHash.add(teacher.id, teacher);
}

function addRoomSubmit() {
    var checkboxs = $("#roomTable").find("input[type=checkbox]:checked");
    $(checkboxs).each(function (index, element) {
        var room = gloRoomHash.get($(this).val());
        addRoom(room);
    });
    $("#roomListDiv span.draggable").draggable(draggableParams);
}

function addRoom(room) {
    room.color = getColorForRoom();
    addRoomToDom(room);
    gloSelectRoomHash.add(room.id, room);
}

function addLesson() {
    var checkboxs = $("#lessonTable").find("input[type=checkbox]:checked");
    var eventArray = new Array();
    $(checkboxs).each(function (index, element) {       
        lesson = gloLessonHash.get($(this).val());
        lesson.color = getColorForLesson();

        gloSelectLessonHash.add(lesson.id, lesson);
        if (!gloLessonCourseIdHash.containsKey(lesson.id)) {
            gloLessonCourseIdHash.add(lesson.id, new jQuery.uniqueArray());
        } else {
            //load lesson courses and load the teachers, rooms related with the courses 
            
            var courseIdArray = gloLessonCourseIdHash.get(lesson.id);
            for (var i = 0; i < courseIdArray.size() ; i++) {
                var course = gloCourseHash.get(courseIdArray.get(i));
                if ('' != course.teacherId && !gloSelectTeacherHash.containsKey(course.teacherId)) {
                    addTeacher(gloTeacherHash.get(course.teacherId));
                }

                if ('' != course.roomId && !gloSelectRoomHash.containsKey(course.roomId)) {
                    addRoom(gloRoomHash.get(course.roomId));
                }
                eventArray.push(createNewEventByCourse(course));
            }
        }
        addLessonToDom(lesson);
    });

    $('#calendar').fullCalendar('addEventSource', eventArray);
    droppable();
    $("#teacherListDiv span.draggable").draggable(draggableParams);
    $("#roomListDiv span.draggable").draggable(draggableParams);
    $("#lessonListDiv span.draggable").draggable(draggableParams);
}

function teacherSelected(_this) {    
    var value = $(_this).val();
    if($(_this).is(':checked')) 
    {
        addEvents($(_this).val());
    }
    else {
        removeEvents($(_this).val());
    }
}

function roomSelected(_this) {
    var value = $(_this).val();
    if ($(_this).is(':checked')) {
        addEvents($(_this).val(), 'room');
    }
    else {
        removeEvents($(_this).val(), 'room');
    }
}

function lessonSelected(_this) {
    var value = $(_this).val();
    if ($(_this).is(':checked')) {
        addEvents($(_this).val(), 'lesson');
        $("span[name=lesson" + $(_this).val() + "]").removeClass("nodraggable");
    }
    else {
        removeEvents($(_this).val(), 'lesson');
        $("span[name=lesson" + $(_this).val() + "]").addClass("nodraggable");
    }
}

function addEvents(id, eventFlag) {
    eventFlag = eventFlag || '';

    var source = [];
    if ('' == eventFlag) {
        var teacher = gloTeacherHash.get(id);
        teacher.show = true;
        if (gloTeacherEventHash.containsKey(id)) {
            source = gloTeacherEventHash.get(id);            
            for (var i = 0; i < source.length; i++) {
                source[i].title = teacher.name;
                source[i].teacherColor = teacher.color;
            }
        }

        if (gloTeacherCourseIdHash.containsKey(id)) {
            var courseIdArray = gloTeacherCourseIdHash.get(id);
            for (var i = 0; i < courseIdArray.items.length; i++) {
                var clientEvents = $("#calendar").fullCalendar('clientEvents', courseIdArray.get(i));
                if (clientEvents.length > 0) {
                    var event = clientEvents[0];
                    event.showTeacher = true;
                    findConflictForEvent(event);
                    $("#calendar").fullCalendar('updateEvent', event);
                }
            }
        }


    } else if ('room' == eventFlag) {
        var room = gloRoomHash.get(id);
        room.show = true;
        if (gloRoomEventHash.containsKey(id)) {
            source = gloRoomEventHash.get(id);
            for (var i = 0; i < source.length; i++) {
                source[i].title = room.name;
                source[i].roomColor = room.color;
            }
        }

        if (gloRoomCourseIdHash.containsKey(id)) {
            var courseIdArray = gloRoomCourseIdHash.get(id);
            for (var i = 0; i < courseIdArray.items.length; i++) {
                var clientEvents = $("#calendar").fullCalendar('clientEvents', courseIdArray.get(i));
                if (clientEvents.length > 0) {
                    var event = clientEvents[0];
                    event.showRoom = true;
                    findConflictForEvent(event);
                    $("#calendar").fullCalendar('updateEvent', event);
                }
            }
        }
    }
    else if ('lesson' == eventFlag) {
        // add event for lesson
        if (gloLessonCourseIdHash.containsKey(id)) {
            var courseIdArray = gloLessonCourseIdHash.get(id);
            for (var i = 0; i < courseIdArray.size() ; i++) {
                var event = createNewEventByCourse(gloCourseHash.get(courseIdArray.get(i)));
                findConflictForEvent(event);
                source.push(event);
            }
        }
    }

    $('#calendar').fullCalendar('addEventSource', source);
    droppable();
}

function removeEvents(id, eventFlag) {
    eventFlag = eventFlag || '';
    var eventId = '';
    if ('' == eventFlag) {
        if (gloTeacherEventHash.containsKey(id)) {
            eventId = id;
        }
        $('#calendar').fullCalendar('removeEvents', id);

        //
        var courseIdArray = gloTeacherCourseIdHash.get(id);
        for (var i = 0; i < courseIdArray.size() ; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', courseIdArray.get(i));
            if (clientEvents.length > 0) {
                var event = clientEvents[0];
                event.showTeacher = false;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }

    } else if ("room" == eventFlag) {
        if (gloRoomEventHash.containsKey(id)) {
            eventId = id;
        }
        $('#calendar').fullCalendar('removeEvents', id);

        var courseIdArray = gloRoomCourseIdHash.get(id);
        for (var i = 0; i < courseIdArray.size() ; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', courseIdArray.get(i));
            if (clientEvents.length > 0) {
                var event = clientEvents[0];
                event.showRoom = false;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    } else if ("lesson" == eventFlag) {
        
        if (gloLessonCourseIdHash.containsKey(id)) {
            var courseIdArray = gloLessonCourseIdHash.get(id);
            for (var i = 0; i < courseIdArray.size() ; i++) {
                $('#calendar').fullCalendar('removeEvents', courseIdArray.get(i));
            }
        }
    }
    
    droppable();
}

//---------------------------------------------------------------------------------------------------------------------
function addTeacherBtnClick() {
    var str = "";
    $("#teacherTable tr:not(:first-child)").remove();
    for (var i = 0; i < gloTeachers.length; i++) {
        if (!gloSelectTeacherHash.containsKey(gloTeachers[i].id)) {
            str = '<tr><td><input type="checkbox" value="' + gloTeachers[i].id + '"></td><td>' + gloTeachers[i].name + '</td><td><select name="' + gloTeachers[i].id + '"><option value="0">请选择</option>' + getTeacherFlagDom(gloTeachers[i].flag) + '</select></td><td><input name="' + gloTeachers[i].id + '" type="text" /></td></tr>';
            $("#teacherTable tbody").append(str);
        }
    }
    showPopup('addTeacherDiv');
}

function addRoomBtnClick() {
    var str = "";
    $("#roomTable tr:not(:first-child)").remove();
    for (var i = 0; i < gloRooms.length; i++) {
        if (!gloSelectRoomHash.containsKey(gloRooms[i].id)) {
            str = '<tr><td><input type="checkbox"  value="' + gloRooms[i].id + '"></td><td>' + gloRooms[i].name + '</td><td>' + gloRooms[i].school+ '</td></tr>';
            $("#roomTable tbody").append(str);
        }
    }
    showPopup('addClassroomDiv');
}

function addLessonBtnClick() {
    var str = "";
    $("#lessonTable tr:not(:first-child)").remove();
    for (var i = 0; i < gloLessons.length; i++) {
        if (!gloSelectLessonHash.containsKey(gloLessons[i].id)) {
            str = '<tr><td><input type="checkbox" value="' + gloLessons[i].id + '"></td><td>' + gloLessons[i].name + '</td></tr>';
            $("#lessonTable tbody").append(str);
        }
    }
    showPopup('addLessonDiv');
}

//----------------------------------------------------------------------------------------------------------------------
function addCourse(date, startTime, endTime, teacherId, roomId, lessonId) {
    var current = moment(date);
    var course = Course.createNew();
    course.id = $.newguid();
    course.day = current.format(gloDateFormat).toString();
    course.start = getEventTime(current.format(gloDateFormat).toString(), startTime);
    course.end = getEventTime(current.format(gloDateFormat).toString(), endTime);    
    gloCourseHash.add(course.id, course);
    gloCourses.push(course);

    if ("0" != teacherId) {
        course.teacherId = teacherId;
        var teacher = null;
        if (gloSelectTeacherHash.containsKey(teacherId)) {
            teacher = gloSelectTeacherHash.get(teacherId);
        } else {
            //get a different color
            teacher = gloTeacherHash.get(teacherId);
            gloSelectTeacherHash.add(teacherId, teacher);
            teacher.color = getColorForTeacher();
            //add teacher to dom
            addTeacherToDom(teacher);
        }

        var teacherCourseArray = null;
        if (gloTeacherCourseIdHash.containsKey(teacherId)) {
            teacherCourseArray = gloTeacherCourseIdHash.get(teacherId);
        } else {
            teacherCourseArray = new jQuery.uniqueArray();
            gloTeacherCourseIdHash.add(teacherId, teacherCourseArray);
        }
        teacherCourseArray.add(course.id);
    }

    if ("0" != roomId) {
        course.roomId = roomId;
        var room = null;
        if (gloSelectRoomHash.containsKey(roomId)) {
            room = gloSelectRoomHash.get(roomId);
        } else {
            //get a different color
            room = gloRoomHash.get(roomId);
            gloSelectRoomHash.add(roomId, room);
            room.color = getColorForRoom();
            //add teacher to dom
            addRoomToDom(room);
        }

        var roomCourseArray = null;
        if (gloRoomCourseIdHash.containsKey(roomId)) {
            roomCourseArray = gloRoomCourseIdHash.get(roomId);
        } else {
            roomCourseArray = new jQuery.uniqueArray()
            gloRoomCourseIdHash.add(roomId, roomCourseArray);
        }
        roomCourseArray.add(course);
    }

    if ("0" != lessonId) {
        course.lessonId = lessonId;
        var lesson = null;
        if (gloSelectLessonHash.containsKey(lessonId)) {
            lesson = gloSelectLessonHash.get(lessonId);
        } else {
            //get a different color
            lesson = gloLessonHash.get(lessonId);
            gloSelectLessonHash.add(lessonId, lesson);
            lesson.color = getColorForLesson();
            //add teacher to dom
            addLessonToDom(lesson);
        }

        var lessonCourseArray = null;
        if (gloLessonCourseIdHash.containsKey(lessonId)) {
            lessonCourseArray = gloLessonCourseIdHash.get(lessonId);
        } else {
            lessonCourseArray = new jQuery.uniqueArray();
            gloLessonCourseIdHash.add(lessonId, lessonCourseArray);
        }
        lessonCourseArray.add(course);
    }

    var event = createNewEventByCourse(course);
    return event;   
}

function addCourses() {
    var beginDate = $("#addCourseBeginDate").val();
    var endDate = $("#addCourseEndDate").val();    
    var teacherId = $("#addCourseTeacherSelect").val();
    var roomId = $("#addCourseRoomSelect").val();
    var lessonId = $("#addCourseLessonSelect").val();

    var startTime1 = $("#addCourseStartTime1").val();
    var endTime1 = $("#addCourseEndTime1").val();
    var startTime2 = $("#addCourseStartTime2").val();
    var endTime2 = $("#addCourseEndTime2").val();
    var startTime3 = $("#addCourseStartTime3").val();
    var endTime3 = $("#addCourseEndTime3").val();

    if ('' == beginDate || '' == endDate) {
        alert("请选择日期");
        return;
    }
    var courseTimeArray = new jQuery.uniqueArray();
    if ('' != startTime1 && endTime1 != "" && endTime1 > startTime1) {
        var courseTime = CourseTime.createNew();
        courseTime.startTime = startTime1;
        courseTime.endTime = endTime1;
        courseTimeArray.add(courseTime);
    }

    if ('' != startTime2 && endTime2 != "" && endTime2 > startTime2) {
        var courseTime = CourseTime.createNew();
        courseTime.startTime = startTime2;
        courseTime.endTime = endTime2;
        courseTimeArray.add(courseTime);
    }

    if ('' != startTime3 && endTime3 != "" && endTime3 > startTime3) {
        var courseTime = CourseTime.createNew();
        courseTime.startTime = startTime3;
        courseTime.endTime = endTime3;
        courseTimeArray.add(courseTime);
    }

    if (courseTimeArray.isEmpty()) {
        alert("请填写时间");
        return;
    }

    beginDate = moment(beginDate);
    endDate = moment(endDate);

    if (endDate.diff(beginDate, "days" ) < 0) {
        alert("结束日期不能大于开始日期");
        return;
    }
    if (endDate.diff(beginDate, "days" ) != 0) {
        if ($("#courseWeekCheckbox").find("input[type=checkbox]:checked").length < 1) {
            alert("请选择星期");
            return;
        }
    }
    var eventArray = new Array();
    if (endDate.diff(beginDate, "days") == 0) {
        for (var j = 0; j < courseTimeArray.size() ; j++) {
            var courseTime = courseTimeArray.get(j);
            var event = addCourse(beginDate, courseTime.startTime, courseTime.endTime, teacherId, roomId, lessonId);
            eventArray.push(event);
        }
    } else {
        var weekArray = Array();
        $("#courseWeekCheckbox").find("input[type=checkbox]:checked").each(function (index, element) {
            weekArray.push(parseInt($(this).val()));
        });
        var count = endDate.diff(beginDate, "days");
        var day = beginDate;
        day.subtract(1, "day");
        for (var i = 0; i < count + 1; i++) {
            day.add(1, "day");
            if (weekArray.indexOf(day.weekday()) > -1) {
                for (var j = 0; j < courseTimeArray.size() ; j++) {
                    var courseTime = courseTimeArray.get(j);
                    var event = addCourse(day, courseTime.startTime, courseTime.endTime, teacherId, roomId, lessonId);
                    eventArray.push(event);
                }
            }
        }
    }

    for (var i = 0; i < eventArray.length; i++) {
        findConflictForEvent(eventArray[i]);
    }

    var source = eventArray;
    $('#calendar').fullCalendar('addEventSource', source);
    droppable();
    closePopup('addCourseDiv');
}

function getColorForTeacher() {
    var selects = $("#teacherListDiv").find("select.colorselect");
   
    if (selects.length > 0) {
        for (var i = 0; i < gloTeacherColorArray.length; i++) {
            var color = gloTeacherColorArray[i];
            var using = false;
            selects.each(function (index, element) {
                if (color == $(this).val()) {
                    using = true;
                    return false;
                }
            });
            if (!using) {
                return color;
            }
        }
    }
    return gloTeacherColorArray[0];
}

function getColorForRoom() {
    var selects = $("#roomListDiv").find("select.colorselect");

    if (selects.length > 0) {
        for (var i = 0; i < gloRoomColorArray.length; i++) {
            var color = gloRoomColorArray[i];
            var using = false;
            selects.each(function (index, element) {
                if (color == $(this).val()) {
                    using = true;
                    return false;
                }
            });
            if (!using) {
                return color;
            }
        }
    }
    return gloRoomColorArray[0];
}

function getColorForLesson() {
    var selects = $("#lessonListDiv").find("select.colorselect");

    if (selects.length > 0) {
        for (var i = 0; i < gloLessonColorArray.length; i++) {
            var color = gloLessonColorArray[i];
            var using = false;
            selects.each(function (index, element) {
                if (color == $(this).val()) {
                    using = true;
                    return false;
                }
            });
            if (!using) {
                return color;
            }
        }
    }
    return gloLessonColorArray[0];
}

function addTeacherToDom(teacher) {
    if (null != teacher) {
        var str = '\
                    <div class="teacherdom' + teacher.id + '"> \
                        <span><input type="checkbox" onclick="teacherSelected(this);" value="' + teacher.id + '" /></span> \
                        <span class="teachername draggable" name="teacher' + teacher.id + '">' + teacher.name + '</span><span class="teachername">&nbsp;</span><span class="teachername">0</span> \
                        <span> \
                            <select class="colorselect" onchange="teacherColorChange(this, \'' + teacher.id + '\');"> ' + getColorDom(teacher) + ' </select> \
                        </span> \
                        <span class="removeteacher" onclick="removeTeacher(\'' + teacher.id + '\')">×</span> \
                        <span><a onclick="teacherDetail(this, \'' + teacher.id + '\');">详细</a></span> \
                    </div>';
        $("#teacherListDiv").append(str);
    }
}

function teacherDetail(_this, teacherId) {
    gloTeacherId = teacherId;
    var teacher = gloTeacherHash.get(teacherId);
    var position = $(_this).position();
    $("#teacherDetailDiv").css("top", position.top);
    $("#teacherDetailDiv").css("left", position.left);
    $("#teacherDetailNameSpan").html(teacher.name);
    $("#teacherDetailFlagSelect").val(teacher.flag);
    $("#teacherDetailContentText").val(teacher.content);
    $("#teacherDetailDiv").show();
    event.stopPropagation();
}

function addRoomToDom(room) {
    if (null != room) {
        var str = '\
                    <div class="roomdom' + room.id + '"> \
                        <span><input type="checkbox" onclick="roomSelected(this);" value="' + room.id + '" /></span> \
                        <span class="roomname draggable" name="room' + room.id + '">' + room.name + '</span> \
                        <span>' + room.school + '</span> \
                        <span> \
                            <select class="colorselect" onchange="roomColorChange(this, \'' + room.id + '\');"> ' + getColorDom(room, 'room') + ' </select> \
                        </span> \
                        <span class="removeroom" onclick="removeRoom(\'' + room.id + '\')">×</span> \
                    </div>';
        $("#roomListDiv").append(str);
    }
}

function addLessonToDom(lesson) {
    var str = '\
                    <tr name="' + lesson.id + '" class="content"> \
                        <td><input type="checkbox" onclick="lessonSelected(this);" value="' + lesson.id + '" checked="checked" /></td> \
                        <td><span class="lessonname draggable" name="lesson' + lesson.id + '">' + lesson.name + '</span></td> \
                        <td><span class="totalhour">'+ lesson.totalHour + '</span></td> \
                        <td><span class="schedulehour">'+ lesson.scheduleHour + '</span></td> \
                        <td><img src="images/arrowdown.jpg" class="img" alt="" onclick="toggleDiv(\'' + lesson.id + '\');" /></td> \
                    </tr> \
                    <tr  name="' + lesson.id + 'tr" class="hidediv"> \
                    <td colspan="5"><div class="lessondropdiv" name="' + lesson.id + 'div"></div></td> \
                    </tr>';
    $("#lessonListTable").append(str);
    refreshLessonDropDiv(lesson);
}

function removeTeacher(teacherId) {
    if (!gloTeacherCourseIdHash.containsKey(teacherId)) {
        $(".teacherdom" + teacherId).remove();
        gloSelectTeacherHash.remove(teacherId);
    }
}

function removeRoom(roomId) {
    if (!gloRoomCourseIdHash.containsKey(roomId)) {
        $(".roomdom" + roomId).remove();
        gloSelectRoomHash.remove(roomId);
    }
}

function removeLesson(lessonId) {
    //remove all course and event from current view
}


function refreshLessonDropDiv(lesson) {
    //compute teacher and teacher hours
    var teacherHash = new jQuery.hashtable();
    var roomIdArray = new jQuery.uniqueArray();
    var courseIdArray = gloLessonCourseIdHash.get(lesson.id);
    var courseHours = 0;
    for (var i = 0; i < courseIdArray.size() ; i++) {
        var course = gloCourseHash.get(courseIdArray.get(i));
        if ('' != course.teacherId) {
            if (teacherHash.containsKey(course.teacherId)) {
                var hours = teacherHash.get(course.teacherId);
                hours += parseInt(course.hour);
                courseHours +=  parseInt(course.hour);
                teacherHash.set(course.teacherId, hours);
            } else {
                courseHours += parseInt(course.hour);
                teacherHash.add(course.teacherId, course.hour)
            }
        }        
        if ('' != course.roomId && !roomIdArray.contains(course.roomId)) {
            roomIdArray.add(course.roomId)
        }
    }
    var dom = '<select class="colorselect" onchange="lessonColorChange(this, \'' + lesson.id + '\');"> ' + getColorDom(lesson, 'lesson') + ' </select>';
    dom += '<input type="button" onclick="removeLesson(\'' + lesson.id + '\')" value="删除" />'
    dom += '<p>教师</p>';
    for (var i = 0; i < teacherHash.keys.length; i++) {
        var teacher = gloTeacherHash.get(teacherHash.keys[i]);
        dom += '<div name="' + teacher.id + '"><span>' + teacher.name + '</span><span>' + teacherHash.get(teacherHash.keys[i]) + '</span></div>';
    }

    dom += '<p>教室</p>';
    for (var i = 0; i < roomIdArray.items.length; i++) {
        dom += '<div name="' + roomIdArray.items[i] + '"><span>' + gloRoomHash.get(roomIdArray.items[i]).name + '</span></div>';
    }
    $("#lessonListTable div[name=" + lesson.id + "div]").html(dom);
    $('tr[name=' + lesson.id+ '] span.schedulehour').html(courseHours);
}

function toggleDiv(lessonId) {
    var img = $("#lessonListTable tr[name=" + lessonId + "] img");
    var tr = $("#lessonListTable tr[name=" + lessonId + "tr]");
    if (tr.hasClass("hidediv")) {
        tr.removeClass("hidediv").addClass("showdiv");
        img.attr("src", "images/arrowup.jpg");
    } else {
        tr.removeClass("showdiv").addClass("hidediv");
        img.attr("src", "images/arrowdown.jpg");
    }
}

function teacherColorChange(_this, teacherId) {
    var color = $(_this).val();
    if (gloTeacherCourseIdHash.containsKey(teacherId)) {
        var teacher = gloTeacherHash.get(teacherId);
        teacher.color = color;
        var courseArray = gloTeacherCourseIdHash.get(teacherId);
        for (var i = 0; i < courseArray.size() ; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', courseArray.get(i));
            if (clientEvents.length > 0) {
                var event = clientEvents[0];
                event.teacherColor = color;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    }
    //all teacher events that have the same id with the teacher they are related with.
    if(gloTeacherEventHash.contains(teacherId)) {
        var clientEvents = $("#calendar").fullCalendar('clientEvents', teacherId);
        if (clientEvents.length > 0) {
            for (var i = 0; i < clientEvents.length; i++) {
                var event = clientEvents[i];
                event.teacherColor = color;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    }
    
    droppable();
}

function roomColorChange(_this, roomId) {    
    var color = $(_this).val();
    if (gloRoomCourseIdHash.containsKey(roomId)) {
        var room = gloRoomHash.get(roomId);
        room.color = color;
        var courseArray = gloRoomCourseIdHash.get(roomId);
        for (var i = 0; i < courseArray.size() ; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', courseArray.get(i));
            if (clientEvents.length > 0) {
                var event = clientEvents[0];
                event.roomColor = color;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    }

    if (gloRoomEventHash.contains(roomId)) {
        var clientEvents = $("#calendar").fullCalendar('clientEvents', roomId);
        if (clientEvents.length > 0) {
            for (var i = 0; i < clientEvents.length; i++) {
                var event = clientEvents[i];
                event.roomColor = color;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    }
    droppable();
}

function lessonColorChange(_this, lessonId) {
    var color = $(_this).val();
    if (gloLessonCourseIdHash.containsKey(lessonId)) {
        var lesson = gloLessonHash.get(lessonId);
        lesson.color = color;
        var eventArray = gloLessonCourseIdHash.get(lessonId);
        for (var i = 0; i < eventArray.size(); i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', eventArray.get(i));
            if (clientEvents.length > 0) {
                var event = clientEvents[0];
                event.lessonColor = color;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    }
    droppable();
}
//-------------------------------------------------------------------------------------------------------------------
//----page initialize
//---------------------------------------------------------------------------------------------------------------------------------

function getTeacherFlagDom(value) {
    value = value || '';
    var rtn = "";
    var selected = "";
    for (var i = 0; i < gloTeacherFlagNameArray.length; i++) {
        selected = "";
        if (value == i+1) {
            selected = 'selected="selected"';
        }
        rtn += '<option value="' + (i + 1) + '" '+selected+'>' + gloTeacherFlagNameArray[i]+ '</option>';
    }
    return rtn;
}

function getColorDom(obj, objFlag) {
    objFlag = objFlag || '';
    var colorArray = gloTeacherColorArray;
    var nameArray = gloTeacherColorNameArray;
    if ('room' == objFlag) {
        colorArray = gloRoomColorArray;
        nameArray = gloRoomColorNameArray;
    } else if ('lesson' == objFlag) {
        colorArray = gloLessonColorArray;
        nameArray = gloLessonColorNameArray;
    }
    var color = obj.color;
    var rtn = "";
    var selected = "";
    for (var i = 0; i < colorArray.length; i++) {
        selected = "";
        if (color == colorArray[i]) {
            selected = 'selected="selected"';
        }
        rtn += '<option value="' + colorArray[i] + '" ' + selected + '>' + nameArray[i] + '</option>';
    }
    return rtn;
}

function setPopupPosition() {
    var popupdiv = $(".popupdiv");
    if (popupdiv.length > 0) {
        popupdiv.each(function () {
            var height = $(this).height();
            var width = $(this).width();

            $(this).css("top", (($(window).height() - height) / 2 - 20) + "px");
            $(this).css("left", ($(window).width() - width) / 2 + "px");
        });
    }
}

function showPopup(divid) {
    $("#bgDiv").show();
    $("#" + divid).show();
}

function closePopup(divid) {
    $("#" + divid).hide();
    $("#bgDiv").hide();
}

function showCalendar() {
    $('#calendar').fullCalendar({
        defaultDate: new Date(),
        eventLimit: true,
        displayEventEnd: true,
        timeFormat: 'H:mm',
        firstDay: 1,
        header: {
            left: '',
            center: 'title',
            right: ''
        },
        events: gloInitEvents,
        eventClick: eventClick,
        dayClick: dayClick
    });
}

//-------------------------------------------------------------------------------------------------------------------
//----data initialize
//---------------------------------------------------------------------------------------------------------------------------------
function getEventTime(date, time) {
    return moment(date + " " + time, gloMomentFormat).format(gloTimeFormat).toString();
}

function initData() {
    initTeachers();
    initClassrooms();
    initLessons();
    initCourse();
    for (var i = 0; i < gloCourses.length; i++) {
        initPageCourseData(i);
    }
    initEvents();
    initAddCourseDiv();
    initTeacherEvent();
    initRoomEvent();
    initTeacherDetailFlag();
}

function initPageCourseData(index) {
    //
    gloCourses[index].teacherId = gloTeachers[index].id;
    gloCourses[index].roomId = gloRooms[index].id;
    gloCourses[index].lessonId = gloLessons[index].id;

    var teacherCurseArray = new jQuery.uniqueArray();
    teacherCurseArray.add(gloCourses[index].id);

    var roomCurseArray = new jQuery.uniqueArray();
    roomCurseArray.add(gloCourses[index].id);

    var lessonCurseArray = new jQuery.uniqueArray();
    lessonCurseArray.add(gloCourses[index].id);
    //set up the relationship of course and teacher, room, lesson
    gloTeacherCourseIdHash.add(gloTeachers[index].id, teacherCurseArray);
    gloRoomCourseIdHash.add(gloRooms[index].id, roomCurseArray);
    gloLessonCourseIdHash.add(gloLessons[index].id, lessonCurseArray);

    //only init the first course data when initializing
    if (0 == index) {
        gloSelectTeacherHash.add(gloTeachers[index].id, gloTeachers[index]);
        gloSelectRoomHash.add(gloRooms[index].id, gloRooms[index]);
        gloSelectLessonHash.add(gloLessons[index].id, gloLessons[index]);
        //init dom
        gloTeachers[index].color = gloTeacherColorArray[index];
        gloRooms[index].color = gloRoomColorArray[index];
        gloLessons[index].color = gloLessonColorArray[index];

        addTeacherToDom(gloTeachers[index]);
        addRoomToDom(gloRooms[index]);
        addLessonToDom(gloLessons[index]);
    }
}

function initAddCourseDiv() {
    for (var i = 0; i < gloTeachers.length; i++) {
        $("#addCourseTeacherSelect").append('<option value="' + gloTeachers[i].id + '">' + gloTeachers[i].name + '</option>');
    }

    $("#addCourseTeacherFlagSelect").append(getTeacherFlagDom(0));

    for (var i = 0; i < gloRooms.length; i++) {
        $("#addCourseRoomSelect").append('<option value="' + gloRooms[i].id + '">' + gloRooms[i].name + '</option>');
    }

    for (var i = 0; i < gloLessons.length; i++) {
        $("#addCourseLessonSelect").append('<option value="' + gloLessons[i].id + '">' + gloLessons[i].name + '</option>');
    }

    var now = moment(new Date());
    $("#addCourseBeginDate").val(now.format(gloDateFormat).toString());
    $("#addCourseEndDate").val(now.format(gloDateFormat).toString());
}

function initTeachers() {
    var teacherStr = '张一;张二;张三;王一;王二;王三;李一;李二;李三;';
    $.each(teacherStr.split(";"), function (index, element) {
        if ("" != element) {
            var arr = element.split(",");
            var teacher = Teacher.createNew();
            teacher.id = $.newguid();
            teacher.name = arr[0];
            gloTeachers.push(teacher);
            gloTeacherHash.add(teacher.id, teacher);
        }
    });
}

function initClassrooms() {
    var roomStr = '教室一,海淀校区;教室二,朝阳校区;教室三,海淀校区;教室四,西城区;教室五,东城区';
    $.each(roomStr.split(";"), function (index, element) {
        if ("" != element) {
            var arr = element.split(",");
            var room = Classroom.createNew();
            room.id = $.newguid();
            room.name = arr[0];
            room.school = arr[1];
            gloRooms.push(room);
            gloRoomHash.add(room.id, room);
        }
    });
}

function initLessons() {
    var lessonStr = '物理班一;物理班二;物理班三;物理班四;物理班五';

    $.each(lessonStr.split(";"), function (index, element) {
        if ("" != element) {
            var arr = element.split(",");
            var lesson = Lesson.createNew();
            lesson.id = $.newguid();
            lesson.name = arr[0];
            gloLessons.push(lesson);
            gloLessonHash.add(lesson.id, lesson);
        }
    });
}

function initCourse() {
    var dayArray = [1, 3, 5];
    var start = "09:30";
    var end = "11:00";
    var now = new Date();
    for (var i = 0; i < dayArray.length; i++) {
        var date = moment([now.getFullYear(), now.getMonth(), dayArray[i]]);
        var course = Course.createNew();
        course.id = $.newguid();
        course.day = date.format(gloDateFormat).toString();
        course.start = getEventTime(course.day, start);
        course.end = getEventTime(course.day, end);
        gloCourses.push(course);
        gloCourseHash.add(course.id, course);
    }
}

function initEvents() {
    if (gloCourses.length > 0) {
        for (var i = 0; i < gloCourses.length; i++) {
            var event = createNewEventByCourse(gloCourses[i]);
            gloInitEvents.push(event);
            break;
        }
    }
}

function initTeacherEvent() {
    var event = null;
    var dayArray = [2, 3, 5];
    var start = "09:30";
    var end = "11:30";
    var now = new Date();
    for (var i = 0; i < 3; i++) {
        var date = moment([now.getFullYear(), now.getMonth(), dayArray[i]]);
        event = Event.createNew();
        event.id = gloTeachers[i].id;
        event.day = date.format(gloDateFormat).toString();
        event.start = getEventTime(event.day, start);
        event.end = getEventTime(event.day, end);
        event.teacherId = gloTeachers[i].id;
        event.className = 'teacherevent';

        var eventArray = null;
        if (gloTeacherEventHash.containsKey(gloTeachers[i].id)) {
            eventArray = gloTeacherEventHash.get(gloTeachers[i].id);
            
        } else {
            eventArray = new Array();
            gloTeacherEventHash.add(gloTeachers[i].id, eventArray);
        }
        eventArray.push(event);
    }
}

function initRoomEvent() {
    var event = null;
    var dayArray = [2, 3, 6];
    var start = "09:30";
    var end = "11:30";
    var now = new Date();
    for (var i = 0; i < 3; i++) {
        var date = moment([now.getFullYear(), now.getMonth(), dayArray[i]]);
        event = Event.createNew();
        event.id = gloRooms[i].id;
        event.day = date.format(gloDateFormat).toString();
        event.start = getEventTime(event.day, start);
        event.end = getEventTime(event.day, end);
        event.roomId = gloRooms[i].id;
        event.className = 'roomevent';

        var eventArray = null;
        if (gloRoomEventHash.containsKey(gloRooms[i].id)) {
            eventArray = gloRoomEventHash.get(gloRooms[i].id);

        } else {
            eventArray = new Array();
            gloRoomEventHash.add(gloRooms[i].id, eventArray);
        }
        eventArray.push(event);
    }
}

function createNewEventByCourse(course) {
    var event = Event.createNew();
    event.id = course.id;
    event.day = course.day;
    event.start = course.start;
    event.end = course.end;
    event.teacherId = course.teacherId;
    event.roomId = course.roomId;
    event.lessonId = course.lessonId;
    if ('' != course.teacherId) {
        var teacher = gloTeacherHash.get(course.teacherId);
        event.teacherColor = teacher.color;
        event.showTeacher = teacher.show;
    }
    if ('' != course.roomId) {
        var room = gloRoomHash.get(course.roomId);
        event.roomColor = room.color;
        event.showRoom = room.show;
        event.title = room.school;
    }
    if ('' != course.lessonId) {
        var lesson = gloLessonHash.get(course.lessonId);
        event.lessonColor = lesson.color;
    }
    return event;
}

function initMonthPicker() {
    var options = {
        pattern: 'yyyy-mm', // Default is 'mm/yyyy' and separator char is not mandatory
        selectedYear: gloMonth.year(),
        startYear: gloMonth.year() - 10,
        finalYear: gloMonth.year() + 5,
        selectedMonth:gloMonth.month() + 1,
        onSelect: monthChange,
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };

    $('#hidMonth').monthpicker(options);
    var datepicker = $("body").find("div.ui-datepicker");
    datepicker.css("position", "relative");
    datepicker.css("top", "0px");
    $("#divMonth").append(datepicker);
    $('#hidMonth').monthpicker('show');
}

function initTeacherDetailFlag() {
    for (var i = 0; i < gloTeacherFlagNameArray.length; i++) {
        $("#teacherDetailFlagSelect").append('<option value="' + (i + 1) + '">' + gloTeacherFlagNameArray[i] + '</option>');
    }
}

var Teacher = {
    createNew: function () {
        var teacher = {};
        teacher.id = 0;
        teacher.name = "";
        teacher.color = "";
        teacher.hour = 0;
        teacher.flag = 0;
        teacher.content = "";
        teacher.show = false;
        return teacher;
    }
}

var Classroom = {
    createNew: function () {
        var classroom = {};
        classroom.id = 0;
        classroom.name = "";
        classroom.color = "";
        classroom.school = "";
        classroom.show = false;
        return classroom;
    }
}

var Lesson = {
    createNew: function () {
        var lesson = {};
        lesson.id = 0;
        lesson.name = "";
        lesson.color = "";
        lesson.totalHour = 60;
        lesson.scheduleHour = 0;
        lesson.show = false;
        return lesson;
    }
}

var Course = {
    createNew: function () {
        var course = {};
        course.id = 0;
        course.day = 0;
        course.start = "";
        course.end = "";
        course.teacherId = "";
        course.roomId = "";
        course.lessonId = "";
        course.hour = 2;
        course.flag = '';
        return course;
    }
}

var Event = {
    createNew: function () {
        var event = {};
        event.id = 0;
        event.title = "";
        event.day = 0;
        event.start = "";
        event.end = "";
        event.className = 'courseevent';
        event.teacherId = ""
        event.roomId = "";
        event.lessonId = "";
        event.teacherColor = "";
        event.roomColor = "";
        event.lessonColor = "";
        event.conflict = "";
        event.showTeacher = false;
        event.showRoom = false;
        return event;
    }
}

var CourseTime = {
    createNew: function () {
        var courseTime = {};
        courseTime.startTime = "";
        courseTime.endTime = "";     
        return courseTime;
    }
}

function monthChange(monthParam) {
    if (gloMonth == monthParam) {
        return;
    }
    gloMonth = monthParam;
    //getServerData(gloMonth, gloTeacher);
}

function bodyClick() {
    if ($("#teacherDetailDiv").is(":visible")) {
        $("#teacherDetailDiv").hide();
    }
    if ($("#schedulingSelectDiv").is(":visible")) {
        $("#schedulingSelectDiv").hide();
    }
}

function teacherDetailSubmit() {
    var teacher = gloTeacherHash.get(gloTeacherId);
    teacher.flag = $("#teacherDetailFlagSelect").val();
    teacher.content = $("#teacherDetailContentText").val();
    $("#teacherDetailDiv").hide();
}

function removeCoursesPopup() {
    $("#deleteCourseTable tr:not(:first-child)").remove();
    for (var i = 0; i < gloCourses.length; i++) {
        var course = gloCourses[i];
        var lessionName = '';
        var teacherName = '';
        var roomName = '';
        var teacherHour = 0;
        var teacherFlag = '';
        var teacherContent = '';
        var date = moment(course.start).format(gloDateFormat).toString();
        var start = moment(course.start).format(gloDateTimeFormat).toString();
        var end = moment(course.end).format(gloDateTimeFormat).toString();
        if ('' != course.lessonId) {
            lessionName = gloLessonHash.get(course.lessonId).name;
        }
        if ('' != course.teacherId) {
            var teacher = gloTeacherHash.get(course.teacherId);
            teacherName = teacher.name;
            teacherHour = teacher.hour;
            if ('' != teacher.flag && '0' != teacher.flag) {
                teacherFlag = gloTeacherFlagNameArray[parseInt(teacher.flag) - 1];
            }
            teacherContent = teacher.content;
        }
        if ('' != course.roomId) {
            roomName = gloRoomHash.get(course.roomId).name;
        }
        $("#deleteCourseTable").append('<tr><td><input type="checkbox" value="' + course.id + '" /></td><td>'+date+'</td><td>' + start + '</td><td>' + end + '</td><td>' + lessionName + '</td><td>' + teacherName + '</td><td>' + roomName + '</td><td>' + teacherHour + '</td><td>' + teacherFlag + '</td></tr>');
    }
    showPopup('deleteCourseDiv');
}

function removeCourses() {
    var checkboxs = $("#deleteCourseTable").find("input[type=checkbox]:checked");
    var idArray = new Array();
    if (checkboxs.length < 1) {
        return;
    }
    //if (checkboxs.length > 0) {
    //    checkboxs.each(function () {
    //        var courseId = $(this).val();
    //        var course = gloCourseHash.get(courseId);

    //        //remove from teacher hash
    //        if ('' != course.teacherId) {
    //            var courseArray = gloTeacherCourseIdHash.get(course.teacherId);
    //            for (var i = 0; i < courseArray.length; i++) {
    //                if (courseArray[i].id == courseId) {                        
    //                    courseArray.splice(i, 1);
    //                }
    //            }
    //        }
    //        //remove from room hash
    //        if ('' != course.roomId) {
    //            var courseArray = gloRoomCourseIdHash.get(course.roomId);
    //            for (var i = 0; i < courseArray.length; i++) {
    //                if (courseArray[i].id == courseId) {
    //                    courseArray.splice(i, 1);
    //                }
    //            }
    //        }

    //        if ('' != course.lessonId) {
    //            var courseArray = gloLessonCourseIdHash.get(course.lessonId);
    //            for (var i = 0; i < courseArray.length; i++) {
    //                if (courseArray[i].id == courseId) {
    //                    courseArray.splice(i, 1);
    //                }
    //            }
    //        }
    //        //remove course
    //        for (var i = 0; i < gloCourses.length; i++) {
    //            if (gloCourses[i].id == courseId) {
    //                gloCourseHash.remove(courseId)
    //                gloCourses.splice(i, 1);
    //            }
    //        }
    //        idArray.push(courseId);
    //    });

    //    //remove from lesson hash
    //    var clientEvents = $("#calendar").fullCalendar('clientEvents', event.id);
    //}
    closePopup('deleteCourseDiv');
}

