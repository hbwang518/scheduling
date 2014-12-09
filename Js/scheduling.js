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
var gloEvents = new Array();
var gloTeachers = new Array();
var gloRooms = new Array();
var gloLessons = new Array();
var gloCourses = new Array();
var gloEvent = null;
var gloCalEvent = null;
var gloCourseHash = new jQuery.hashtable();
var gloEventHash = new jQuery.hashtable();
var gloTeacherHash = new jQuery.hashtable();
var gloRoomHash = new jQuery.hashtable();
var gloLessonHash = new jQuery.hashtable();

// teacher list and room list
var gloSelectTeacherHash = new jQuery.hashtable();
var gloSelectRoomHash = new jQuery.hashtable();
var gloSelectLessonHash = new jQuery.hashtable();
var gloTeacherColorArray = ["#ff0000", "#ffff00", "#008000", "#0000ff"];
var gloTeacherColorNameArray = ["红色", "黄色", "绿色", "蓝色"];
var gloTeacherFlagNameArray = ['雅思', '托福'];
var gloRoomColorArray = ["#ff8c00", "#7fff00", "#8b4513", "#92cd32"];
var gloRoomColorNameArray = ["橙色", "青色", "棕色", "褐色"];
var gloLessonColorArray = ["#ff8c00", "#7fff00", "#8b4513", "#92cd32"];
var gloLessonColorNameArray = ["橙色", "青色", "棕色", "褐色"];

//global relationship
var gloTeacherCourseHash = new jQuery.hashtable();
var gloRoomCourseHash = new jQuery.hashtable();
var gloLessonCourseHash = new jQuery.hashtable();
var gloEventBorderColor = '';
var gloTeacherEventHash = new jQuery.hashtable();
var gloRoomEventHash = new jQuery.hashtable();
var gloLessonEventHash = new jQuery.hashtable();

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
    snap: true
}

var droppableParams = {
    drop: drop,
    tolerance: 'pointer'
}

function test() {
    var event = gloEvents[0];
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
    findConflictForEvent(event)
    $("#calendar").fullCalendar('updateEvent', event);
    droppable();
}

function changeTeacher(teacherId, event) {    
    if (teacherId == event.teacherId) {
        return;
    }

    var teacherCourseArray = null;
    if ('' != event.teacherId) {
        //remove course from gloTeacherCourseHash
        teacherCourseArray = gloTeacherCourseHash.get(event.teacherId);
        for (var i = 0; i < teacherCourseArray.length; i++) {
            if (teacherCourseArray[i].id == event.id) {
                teacherCourseArray.splice(i, 1);
                break;
            }
        }
    }
    var teacher = gloTeacherHash.get(teacherId);
    event.teacherId = teacher.id;
    event.teacherColor = teacher.color;
    
    if (gloTeacherCourseHash.containsKey(teacher.id)) {
        teacherCourseArray = gloTeacherCourseHash.get(teacher.id);
    } else {
        teacherCourseArray = new Array();
        gloTeacherCourseHash.add(teacher.id, teacherCourseArray);
    }
    course = gloCourseHash.get(event.id);
    course.teacherId = teacher.id;
    teacherCourseArray.push(course);
}

function changeRoom(roomId, event) {
    if (roomId == event.roomId) {
        return;
    }

    var roomCourseArray = null;
    if ('' != event.roomId) {
        //remove course from gloRoomCourseHash
        roomCourseArray = gloRoomCourseHash.get(event.roomId);
        for (var i = 0; i < roomCourseArray.length; i++) {
            if (roomCourseArray[i].id == event.id) {
                roomCourseArray.splice(i, 1);
                break;
            }
        }
    }
    var room = gloRoomHash.get(roomId);
    event.roomId = room.id;
    event.roomColor = room.color;

   
    if (gloRoomCourseHash.containsKey(room.id)) {
        roomCourseArray = gloRoomCourseHash.get(room.id);
    } else {
        roomCourseArray = new Array();
        gloRoomCourseHash.add(room.id, roomCourseArray);
    }
    course = gloCourseHash.get(event.id);
    course.roomId = room.id;
    roomCourseArray.push(course);
}

function changeLesson(lessonId, event) {
    if (lessonId == event.lessonId) {
        return;
    }

    var lessonCourseArray = null;
    if ('' != event.lessonId) {
        //remove course from gloLessonCourseHash
        lessonCourseArray = gloLessonCourseHash.get(event.lessonId);
        for (var i = 0; i < lessonCourseArray.length; i++) {
            if (lessonCourseArray[i].id == event.id) {
                lessonCourseArray.splice(i, 1);
                break;
            }
        }
    }
    var lesson = gloLessonHash.get(lessonId);
    event.lessonId = lesson.id;
    event.lessonColor = lesson.color;


    if (gloLessonCourseHash.containsKey(lesson.id)) {
        lessonCourseArray = gloLessonCourseHash.get(lesson.id);
    } else {
        lessonCourseArray = new Array();
        gloLessonCourseHash.add(lesson.id, lessonCourseArray);
    }
    course = gloCourseHash.get(event.id);
    course.lessonId = lesson.id;
    lessonCourseArray.push(course);
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
    var school = $("#schedulingSchool").val();

    gloCalEvent.start = getEventTime(gloCalEvent.start.format(gloDateFormat).toString(), startTime);
    gloCalEvent.end = getEventTime(gloCalEvent.start.format(gloDateFormat).toString(), endTime);

    var teacherId = $("#schedulingTeacher").val();
    if ("0" != teacherId && teacherId != gloCalEvent.teacherId) {
        changeTeacher(teacherId, gloCalEvent);
    }

    var roomId = $("#schedulingRoom").val();
    if ("0" != roomId && roomId != gloCalEvent.roomId) {
        changeRoom(roomId, gloCalEvent);
    }
    var lessonId = $("#schedulingLesson").val();
    if ("0" != lessonId && lessonId != gloCalEvent.lessonId) {
        changeLesson(lessonId, gloCalEvent);
    }

    var course = gloCourseHash.get(gloCalEvent.id);
    course.school = school;
    gloCalEvent.title = school;
    course.start = gloCalEvent.start;
    course.end = gloCalEvent.end;
    course.teacherId = gloCalEvent.teacherId;
    course.roomId = gloCalEvent.roomId;
    course.lessonId = gloCalEvent.lessonId;

    findConflictForEvent(gloCalEvent);

    $("#calendar").fullCalendar('updateEvent', gloCalEvent);

    gloEventBorderColor = gloEvent.css('border-color');
    gloEvent.css('border-color', 'yellow');   
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
    $("#schedulingSchool").val(calEvent.title || '');

    var teacherId = calEvent.teacherId || '';
    if ('' != teacherId) {
        $("#schedulingTeacher").val(teacherId);
    }

    var roomId = calEvent.roomId || '';
    if ('' != roomId) {
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

function addTeacher() {
    var checkboxs = $("#teacherTable").find("input[type=checkbox]:checked");
    $(checkboxs).each(function (index, element) {
        var teacher = gloTeacherHash.get($(this).val());
        teacher.color = getColorForTeacher();
        teacher.flag = $("#teacherTable").find('select[name=' + $(this).val() + ']').val();
        teacher.content = $("#teacherTable").find('input[name=' + $(this).val() + ']').val();
        addTeacherToDom(teacher);
        gloSelectTeacherHash.add(teacher.id, teacher);
    });
    $("#teacherListDiv span.draggable").draggable(draggableParams);
}

function addRoom() {
    var checkboxs = $("#roomTable").find("input[type=checkbox]:checked");
    $(checkboxs).each(function (index, element) {
        var room = null;
        for (var i = 0; i < gloRooms.length; i++) {
            if (gloRooms[i].id == $(this).val()) {
                room = gloRooms[i];
                room.color = getColorForRoom();
            }
        }
        if (null != room) {
            addRoomToDom(room);
            gloSelectRoomHash.add(room.id, room);
        }
    });
    $("#roomListDiv span.draggable").draggable(draggableParams);
}

function addLesson() {
    var checkboxs = $("#lessonTable").find("input[type=checkbox]:checked");
    $(checkboxs).each(function (index, element) {
        var lesson = null;
        for (var i = 0; i < gloLessons.length; i++) {
            if (gloLessons[i].id == $(this).val()) {
                lesson = gloLessons[i];
                lesson.color = getColorForLesson();
            }
        }
        if (null != lesson) {
            addLessonToDom(lesson);
            gloSelectLessonHash.add(lesson.id, lesson);
        }
    });
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
    }
    else {
        removeEvents($(_this).val(), 'lesson');
    }
}

function addEvents(id, isteacher) {
    isteacher = isteacher || '';

    var source = [];
    if ('' == isteacher) {
        if (gloTeacherEventHash.containsKey(id)) {
            source = gloTeacherEventHash.get(id);
            var teacher = gloTeacherHash.get(id);
            for (var i = 0; i < source.length; i++) {
                source[i].title = teacher.name;
                source[i].teacherColor = teacher.color;
            }
        }
    } else if ('room' == isteacher) {
        if (gloRoomEventHash.containsKey(id)) {
            source = gloRoomEventHash.get(id);
            var room = gloRoomHash.get(id);
            for (var i = 0; i < source.length; i++) {
                source[i].title = room.name;
                source[i].roomColor = room.color;
            }
        }
    } else {
        if (gloLessonEventHash.containsKey(id)) {
            source = gloLessonEventHash.get(id);
            var lesson = gloLessonHash.get(id);
            for (var i = 0; i < source.length; i++) {
                source[i].title = lesson.name;
                source[i].lessonColor = lesson.color;
            }
        }
    }
    $('#calendar').fullCalendar('addEventSource', source);
    droppable();
}

function removeEvents(id, isteacher) {
    isteacher = isteacher || '';
    var eventId = '';
    if ('' == isteacher) {
        if (gloTeacherEventHash.containsKey(id)) {
            eventId = id;
        }
    } else {
        if (gloRoomEventHash.containsKey(id)) {
            eventId = id;
        }
    }
    $('#calendar').fullCalendar('removeEvents', id);
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
            str = '<tr><td><input type="checkbox"  value="' + gloRooms[i].id + '"></td><td>' + gloRooms[i].name + '</td><td></td></tr>';
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
function addCourse(date, startTime, endTime, teacherId, roomId, lessonId, school) {
    var current = moment(date);
    var course = Course.createNew();
    course.id = $.newguid();
    course.day = current.format(gloDateFormat).toString();
    course.start = getEventTime(current.format(gloDateFormat).toString(), startTime);
    course.end = getEventTime(current.format(gloDateFormat).toString(), endTime);
    course.school = school;
    gloCourseHash.add(course.id, course);
    gloCourses.push(course);

    var teacherColor = ""
    var roomColor = "";
    var lessonColor = "";
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
        teacherColor = teacher.color;

        var teacherCourseArray = null;
        if (gloTeacherCourseHash.containsKey(teacherId)) {
            teacherCourseArray = gloTeacherCourseHash.get(teacherId);
        } else {
            teacherCourseArray = new Array();
            gloTeacherCourseHash.add(teacherId, teacherCourseArray);
        }
        teacherCourseArray.push(course);
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
        roomColor = room.color;

        var roomCourseArray = null;
        if (gloRoomCourseHash.containsKey(roomId)) {
            roomCourseArray = gloRoomCourseHash.get(roomId);
        } else {
            roomCourseArray = new Array();
            gloRoomCourseHash.add(roomId, roomCourseArray);
        }
        roomCourseArray.push(course);
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
        lessonColor = lesson.color;

        var lessonCourseArray = null;
        if (gloLessonCourseHash.containsKey(lessonId)) {
            lessonCourseArray = gloLessonCourseHash.get(lessonId);
        } else {
            lessonCourseArray = new Array();
            gloLessonCourseHash.add(lessonId, lessonCourseArray);
        }
        lessonCourseArray.push(course);
    }

    var event = createNewEventByCourse(course);
    event.teacherColor = teacherColor;
    event.roomColor = roomColor;
    event.lessonColor = lessonColor;
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

    var school = $("#addCourseSchool").val();

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
            var event = addCourse(beginDate, courseTime.startTime, courseTime.endTime, teacherId, roomId, lessonId, school);
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
                    var event = addCourse(day, courseTime.startTime, courseTime.endTime, teacherId, roomId, lessonId, school);
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
                    <div> \
                        <span><input type="checkbox" onclick="teacherSelected(this);" value="' + teacher.id + '" /></span> \
                        <span class="teachername draggable" name="teacher' + teacher.id + '">' + teacher.name + '</span><span class="teachername">&nbsp;</span><span class="teachername">0</span> \
                        <span> \
                            <select class="colorselect" onchange="teacherColorChange(this, \'' + teacher.id + '\');"> ' + getColorDom(teacher) + ' </select> \
                        </span> \
                        <span>×</span> \
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
                    <div> \
                        <span><input type="checkbox" onclick="roomSelected(this);" value="' + room.id + '" /></span> \
                        <span class="roomname draggable" name="room' + room.id + '">' + room.name + '</span> \
                        <span> \
                            <select class="colorselect" onchange="roomColorChange(this, \'' + room.id + '\');"> ' + getColorDom(room, 'room') + ' </select> \
                        </span> \
                        <span>×</span> \
                    </div>';
        $("#roomListDiv").append(str);
    }
}

function addLessonToDom(lesson) {
    if (null != lesson) {
        var str = '\
                    <div> \
                        <span></span> \
                        <span class="lessonname draggable" name="lesson' + lesson.id + '">' + lesson.name + '</span> \
                        <span> \
                            <select class="colorselect" onchange="lessonColorChange(this, \'' + lesson.id + '\');"> ' + getColorDom(lesson, 'lesson') + ' </select> \
                        </span> \
                        <span>×</span> \
                    </div>';
        $("#lessonListDiv").append(str);
    }
}

function teacherColorChange(_this, teacherId) {
    var color = $(_this).val();
    if (gloTeacherCourseHash.containsKey(teacherId)) {
        var teacher = gloTeacherHash.get(teacherId);
        teacher.color = color;
        var eventArray = gloTeacherCourseHash.get(teacherId);
        for (var i = 0; i < eventArray.length; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', eventArray[i].id);
            if (clientEvents.length > 0) {
                var event = clientEvents[0];
                event.teacherColor = color;
                $("#calendar").fullCalendar('updateEvent', event);
            }
        }
    }

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
    if (gloRoomCourseHash.containsKey(roomId)) {
        var room = gloRoomHash.get(roomId);
        room.color = color;
        var eventArray = gloRoomCourseHash.get(roomId);
        for (var i = 0; i < eventArray.length; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', eventArray[i].id);
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
    if (gloLessonCourseHash.containsKey(lessonId)) {
        var lesson = gloLessonHash.get(lessonId);
        lesson.color = color;
        var eventArray = gloLessonCourseHash.get(lessonId);
        for (var i = 0; i < eventArray.length; i++) {
            var clientEvents = $("#calendar").fullCalendar('clientEvents', eventArray[i].id);
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
        events: gloEvents,
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
    initPageCourseData();
    initEvents();
    initAddCourseDiv();
    initTeacherEvent();
    initRoomEvent();
    initTeacherDetailFlag();
}

function initPageCourseData() {
    //
    gloCourses[0].teacherId = gloTeachers[0].id;
    gloCourses[0].roomId = gloRooms[0].id;
    gloCourses[0].lessonId = gloLessons[0].id;
    var teacherCurseArray = new Array();
    teacherCurseArray.push(gloCourses[0]);

    var roomCurseArray = new Array();
    roomCurseArray.push(gloCourses[0]);

    var lessonCurseArray = new Array();
    lessonCurseArray.push(gloCourses[0]);
    //
    gloTeacherCourseHash.add(gloTeachers[0].id, teacherCurseArray);
    gloRoomCourseHash.add(gloRooms[0].id, roomCurseArray);
    gloLessonCourseHash.add(gloLessons[0].id, lessonCurseArray);

    gloSelectTeacherHash.add(gloTeachers[0].id, gloTeachers[0]);
    gloSelectRoomHash.add(gloRooms[0].id, gloRooms[0]);
    gloSelectLessonHash.add(gloLessons[0].id, gloLessons[0]);
    //init dom
    gloTeachers[0].color = gloTeacherColorArray[0];
    gloRooms[0].color = gloRoomColorArray[0];
    gloLessons[0].color = gloLessonColorArray[0];

    addTeacherToDom(gloTeachers[0]);
    addRoomToDom(gloRooms[0]);
    addLessonToDom(gloLessons[0]);
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
    var roomStr = '教室一;教室二;教室三;教室四;教室五';

    $.each(roomStr.split(";"), function (index, element) {
        if ("" != element) {
            var arr = element.split(",");
            var room = Classroom.createNew();
            room.id = $.newguid();
            room.name = arr[0];
            gloRooms.push(room);
            gloRoomHash.add(room.id, room);
        }
    });
}

function initLessons() {
    var lessonStr = '课程一;课程二;课程三;课程四;课程五';

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
        course.school = "朝阳分校";
        gloCourses.push(course);
        gloCourseHash.add(course.id, course);
    }
}

function initEvents() {
    if (gloCourses.length > 0) {
        for (var i = 0; i < gloCourses.length; i++) {
            var event = createNewEventByCourse(gloCourses[i]);
            if ("" != event.teacherId) {
                event.teacherColor = gloTeacherHash.get(event.teacherId).color;
            }
            if ("" != event.roomId) {
                event.roomColor = gloRoomHash.get(event.roomId).color;
            }
            if ("" != event.lessonId) {
                event.lessonColor = gloLessonHash.get(event.lessonId).color;
            }
            gloEvents.push(event);
            gloEventHash.add(event.id, event);
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
    event.title = course.school;
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
        teacher.span = 0;
        teacher.flag = 0;
        teacher.content = "";
        return teacher;
    }
}

var Classroom = {
    createNew: function () {
        var classroom = {};
        classroom.id = 0;
        classroom.name = "";
        classroom.color = "";        
        return classroom;
    }
}

var Lesson = {
    createNew: function () {
        var lesson = {};
        lesson.id = 0;
        lesson.name = "";
        lesson.color = "";
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
        course.span = 2;
        course.flag = '';
        course.school = '';
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
        var teacherSpan = '';
        var teacherFlag = '';
        var teacherContent = '';
        if ('' != course.lessonId) {
            lessionName = gloLessonHash.get(course.lessonId).name;
        }
        if ('' != course.teacherId) {
            var teacher = gloTeacherHash.get(course.teacherId);
            teacherName = teacher.name;
            teacherSpan = teacher.span;
            if ('' != teacher.flag && '0' != teacher.flag) {
                teacherFlag = gloTeacherFlagNameArray[parseInt(teacher.flag) - 1];
            }
            teacherContent = teacher.content;
        }
        if ('' != course.roomId) {
            roomName = gloRoomHash.get(course.roomId).name;
        }
        $("#deleteCourseTable").append('<tr><td><input type="checkbox" value="' + course.id + '" /></td><td>' + moment(course.start).format(gloMomentFormat).toString() + '</td><td>' + moment(course.end).format(gloMomentFormat).toString() + '</td><td>' + lessionName + '</td><td>' + teacherName + '</td><td>' + roomName + '</td><td></td><td>' + teacherFlag + '</td></tr>');
    }
    showPopup('deleteCourseDiv');
}

function removeCourses() {
    var checkboxs = $("#deleteCourseTable").find("input[type=checkbox]:checked");
    if (checkboxs.length > 0) {
        checkboxs.each(function () {
            var courseId = $(this).val();
            //remove course
            //remove event
            //remove teacher hash
            //remove room hash
            //remove lesson hash
        });
    }
    closePopup('deleteCourseDiv');
}

