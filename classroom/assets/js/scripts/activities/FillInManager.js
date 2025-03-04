class FillInManager {
    
    init() {
        $('#fill-in-add-inputs').click(() => {
            if ($("#fill-in-content").getSelectText() != "") {
                $('#fill-in-content').bbcode();
        
                let randomString = Math.random().toString(36).substring(7);
                replaceSelectionWithHtml(`<span class="lms-answer" data-id="${randomString}">${$("#fill-in-content").getSelectText()}</span>\&nbsp`)
                let newText = $('#fill-in-content').htmlcode();
                $('#fill-in-content').htmlcode(newText);
        
                setCaret('fill-in-content', randomString);
            } else {
                $('#fill-in-content').bbcode();
                $('#fill-in-content').htmlcode($('#fill-in-content').htmlcode() + `\&nbsp;<span class="lms-answer">\&nbsp;réponse\&nbsp;</span>\&nbsp`);
            }
        });

        $('body').on('click', '#fill-in-tolerance-increase', function () {
            let tolerance = parseInt($('#fill-in-tolerance').val());
            if (!isNaN(tolerance)) {
                $(`#fill-in-tolerance`).val(tolerance+1);
            } else {
                $(`#fill-in-tolerance`).val(1);
            }
        })
        
        $('body').on('click', '#fill-in-tolerance-decrease', function () {
            let tolerance = parseInt($('#fill-in-tolerance').val());
            if (tolerance > 0) {
                $(`#fill-in-tolerance`).val(tolerance-1);
            }
        })
    }

    parseFillInFieldsAndSaveThem() {
    
        if ($('#fill-in-content').bbcode().match(/\[answer\](.*?)\[\/answer\]/gi) == null) {
            displayNotification('#notif-div', "classroom.notif.noAnswerInActivity", "error");
            return false;
        }
    
        Main.getClassroomManager()._createActivity.content.fillInFields.contentForTeacher = $('#fill-in-content').bbcode();
        let response = $('#fill-in-content').bbcode().match(/\[answer\](.*?)\[\/answer\]/gi).map(match => match.replace(/\[answer\](.*?)\[\/answer\]/gi, "$1"));
        
        response.forEach((e, i) => {
            if (e.includes('&&')) {
                response[i] = e.split('&&').map(e => e.trim()).join(',');
            }
        })
    
        for (let index = 0; index < response.length; index++) {
            response[index] = response[index].trim();
        }
    
        if ($('#fill-in-states').bbcode() != '') {
            Main.getClassroomManager()._createActivity.content.states = $('#fill-in-states').bbcode();
        } else {
            return false;
        }
    
        Main.getClassroomManager()._createActivity.tolerance = $('#fill-in-tolerance').val();
        Main.getClassroomManager()._createActivity.autocorrect = $('#fill-in-autocorrect').is(":checked");
        Main.getClassroomManager()._createActivity.content.hint = $('#fill-in-hint').bbcode();

        Main.getClassroomManager()._createActivity.solution = response;
    
        if (Main.getClassroomManager()._createActivity.content.fillInFields.contentForTeacher == "") {
            return false
        }
        return true;
    }

    fillInValidateActivity(correction = 1, isFromCourse = false) {
        let studentResponse = [],
            activityId = isFromCourse ? coursesManager.actualCourse.activity : Activity.activity.id,
            activityLink = isFromCourse ? coursesManager.actualCourse.link : Activity.id;

        for (let i = 1; i < $(`input[id^="student-fill-in-field-"]`).length+1; i++) {
            let string = document.getElementById(`student-fill-in-field-${i}`).value;
            studentResponse.push(string);
        }

        Main.getClassroomManager().saveNewStudentActivity(activityId, correction, null, JSON.stringify(studentResponse), activityLink).then((response) => {
            if (isFromCourse) {
                coursesManager.coursesResponseManager(response, 'fill-in');
            } else {
                responseManager(response, 'fill-in');
            }
        });
    }

    manageUpdateForFillIn(activity) {
        $('#activity-fill-in').show();
        let content = JSON.parse(activity.content);
        $("#fill-in-states").forceInsertBbcode(content.states);
        $("#fill-in-hint").forceInsertBbcode(content.hint);
        $("#fill-in-tolerance").val(activity.tolerance);
        $("#fill-in-content").forceInsertBbcode(content.fillInFields.contentForTeacher);
        activity.isAutocorrect ? $("#fill-in-autocorrect").prop("checked", true) : $("#fill-in-autocorrect").prop("checked", false);
        navigatePanel('classroom-dashboard-classes-new-activity', 'dashboard-activities-teacher');
    }

    showTeacherFillInActivity(contentParsed, Activity) {
        $("#activity-states").html(bbcodeContentIncludingMathLive(contentParsed.states));
        let contentForTeacher = contentParsed.fillInFields.contentForTeacher;
        contentForTeacher = parseContent(contentForTeacher, "lms-answer fill-in-answer-teacher", true);
        $('#activity-content').html(bbcodeContentIncludingMathLive(contentForTeacher));
        $("#activity-content-container").show();
        $("#activity-states-container").show();
    }

    showTeacherFillInActivityDoable(contentParsed, Activity) {

        let contentDiv = document.getElementById('activity-content');
        contentDiv.innerHTML = "";

        let divActivityDoable = document.createElement('div');
        divActivityDoable.id = "activity-doable" + Activity.id;
        divActivityDoable.classList.add("activity-doable-fill-in-teacher");

        let contentReplaced = contentParsed.fillInFields.contentForTeacher.replaceAll(/\[answer\](.*?)\[\/answer\]/g, "_TOBEREPLACED_");
        let studentContent = bbcodeContentIncludingMathLive(contentReplaced);
        let nbOccu = studentContent.match(/_TOBEREPLACED_/g).length;

        for (let i = 1; i < nbOccu+1; i++) {
            let toBeReplace = studentContent.match(/_TOBEREPLACED_/g)[0];
            studentContent = studentContent.replace(toBeReplace, `<input type="text" id="student-fill-in-field-${i}-preview" class="answer-student">`);
        }

        contentDiv.innerHTML = studentContent;

        $('#preview-states').show();
        $('#preview-activity-drag-and-drop-container').show();
        $('#activity-preview-div').show();
    }


    manageDisplayFillIn(correction, content, correction_div, isFromCourse) {
        let course = isFromCourse ? "-course" : "";
        $('#activity-title'+course).html(Activity.activity.title);
        // Show the content with the response to the teacher
        if (UserManager.getUser().isRegular) {
            let contentForTeacher = content.fillInFields.contentForTeacher;
            contentForTeacher = parseContent(contentForTeacher, "lms-answer fill-in-answer-teacher", true);
            $('#activity-content'+course).html(bbcodeContentIncludingMathLive(contentForTeacher));
            $('#activity-content-container'+course).show();
        }
    
        $('#activity-states'+course).html(bbcodeContentIncludingMathLive(content.states));
        $('#activity-states-container'+course).show();
        
        if (correction <= 1 || correction == null) {
            if (!UserManager.getUser().isRegular) {

                let contentReplaced = content.fillInFields.contentForTeacher.replaceAll(/\[answer\](.*?)\[\/answer\]/g, "_TOBEREPLACED_");
                let studentContent = bbcodeContentIncludingMathLive(contentReplaced);
                let nbOccu = studentContent.match(/_TOBEREPLACED_/g).length;
    
                for (let i = 1; i < nbOccu+1; i++) {
                    let toBeReplace = studentContent.match(/_TOBEREPLACED_/g)[0];
                    studentContent = studentContent.replace(toBeReplace, `<input type="text" id="student-fill-in-field-${i}" class="answer-student">`);
                }
                
                $('#activity-content'+course).html(bbcodeContentIncludingMathLive(studentContent));
    
                // Place the student's response if there is one
                if (Activity.response != null && Activity.response != "") {
                    let response = JSON.parse(Activity.response);
                    for (let i = 0; i < response.length; i++) {
                        let input = document.getElementById(`student-fill-in-field-${i+1}`);
                        if (response[i] != "" && response[i] != null) {
                            input.value = response[i];
                        }
                    }
                }
                $('#activity-content-container'+course).show();
            } else {
                fillInManager.displayFillInTeacherSide(correction_div, correction, content, isFromCourse);
            }
        } else if (correction > 1) {
            fillInManager.displayFillInTeacherSide(correction_div, correction, content, isFromCourse);
        } 
    }

    displayFillInTeacherSide(correction_div, correction, content, isFromCourse) {
        let studentContentString = content.fillInFields.contentForTeacher,
            studentResponses = JSON.parse(Activity.response),
            course = isFromCourse ? "-course" : "";
    
        if (studentResponses != null && studentResponses != "") { 
    
            studentResponses.forEach((response, i) => {
                let autoWidthStyle = 'style="width:' + (response.length + 2) + 'ch"';
                let answer = studentContentString.match(/\[answer\](.*?)\[\/answer\]/g)[0];
                studentContentString = studentContentString.replace(answer, `<input type="text" id="correction-student-fill-in-field-${i}" ${autoWidthStyle} readonly class="fill-in-answer-teacher answer-student" value="${response}">`);
            });
    
    
            Main.getClassroomManager().getActivityAutocorrectionResult(Activity.activity.id, Activity.id).then(result => {
                for (let i = 0; i < studentResponses.length; i++) {
                    if (result.success.includes(i)) {
                        $(`#correction-student-fill-in-field-${i}`).addClass("answer-incorrect");
                    } else {
                        $(`#correction-student-fill-in-field-${i}`).addClass("answer-correct");
                    }
                }
            })
        
            $('#activity-student-response-content'+course).html(bbcodeContentIncludingMathLive(studentContentString));
            $('#activity-student-response'+course).show();
        }
    
        manageCorrectionDiv(correction_div, correction, isFromCourse);
    }

    fillInPreview(activity) {

        let contentReplaced = activity.content.fillInFields.contentForTeacher.replaceAll(/\[answer\](.*?)\[\/answer\]/g, "_TOBEREPLACED_");
        let studentContent = bbcodeContentIncludingMathLive(contentReplaced);
        let nbOccu = studentContent.match(/_TOBEREPLACED_/g).length;

        for (let i = 1; i < nbOccu+1; i++) {
            let toBeReplace = studentContent.match(/_TOBEREPLACED_/g)[0];
            studentContent = studentContent.replace(toBeReplace, `<input type="text" id="student-fill-in-field-${i}-preview" class="answer-student">`);
        }

        $('#preview-activity-content').html(studentContent);
        $('#preview-states').show();
        $('#preview-content').show();
        $('#activity-preview-div').show();
    }
}

const fillInManager = new FillInManager();
fillInManager.init();

