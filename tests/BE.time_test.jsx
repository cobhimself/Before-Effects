/**
 * @fileoverview The script tests the functionality of the BE.comp object.
 * NOTE: It is assumed both TB and BE have been sourced. See
 * beforeeffects_tests.jsx to customize the overall BE test.
 * @author <a href="mailto:collin.brooks@gmail.com">Collin Brooks</a>
 * @version 0.1.0 dev
 */


TB.module('BE.time');
BE.require('BE.time');
BE.require('BE.comp');

TB.test('BE.time properties', function () {
    TB.hasProperty(BE, "time", "time is a property of BE");
    TB.hasProperty(BE.time, "getTimeDisplayTypeString", "BE.time.getTimeDisplayTypeString is a property of BE.time");
    TB.hasProperty(BE.time, "setTimeDisplayType", "BE.time.setTimeDisplayType is a property of BE.time");
    TB.hasProperty(BE.time, "withTimecodeRemembered", "BE.time.withTimecodeRemembered is a property of BE.time");
});

TB.test('BE.time.setTimeDisplayType()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp;

    //The tests differ based upon AE version.
    if (BE.AEVersion < 10.5) {
        //Set the time display type to frames and see if it worked.
        BE.time.setTimeDisplayType("frames");

        TB.equal(
            app.project.timecodeDisplayType,
            TimecodeDisplayType.FRAMES,
            "BE.time.setTimeDisplayType(\"frames\") set correctly!"
        );

        BE.time.setTimeDisplayType("timecode");

        TB.equal(
            app.project.timecodeDisplayType,
            TimecodeDisplayType.TIMECODE,
            "BE.time.setTimeDisplayType(\"timecode\") set correctly!"
        );

        BE.time.setTimeDisplayType("FRAMES");

        TB.equal(
            app.project.timecodeDisplayType,
            TimecodeDisplayType.FRAMES,
            "BE.time.setTimeDisplayType(\"FRAMES\") set correctly!"
        );

        BE.time.setTimeDisplayType("TIMECODE");

        TB.equal(
            app.project.timecodeDisplayType,
            TimecodeDisplayType.TIMECODE,
            "BE.time.setTimeDisplayType(\"TIMECODE\") set correctly!"
        );

    } else {
        //Set the time display type to frames and see if it worked.
        BE.time.setTimeDisplayType("frames");

        TB.equal(
            app.project.timeDisplayType,
            TimeDisplayType.FRAMES,
            "BE.time.setTimeDisplayType(\"frames\") set correctly!"
        );

        BE.time.setTimeDisplayType("timecode");

        TB.equal(
            app.project.timeDisplayType,
            TimeDisplayType.TIMECODE,
            "BE.time.setTimeDisplayType(\"timecode\") set correctly!"
        );

        BE.time.setTimeDisplayType("FRAMES");

        TB.equal(
            app.project.timeDisplayType,
            TimeDisplayType.FRAMES,
            "BE.time.setTimeDisplayType(\"FRAMES\") set correctly!"
        );

        BE.time.setTimeDisplayType("TIMECODE");

        TB.equal(
            app.project.timeDisplayType,
            TimeDisplayType.TIMECODE,
            "BE.time.setTimeDisplayType(\"TIMECODE\") set correctly!"
        );
    }

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.time.getTimeDisplayTypeString()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp;

    //Set the timecode display type to frames for the test.
    if (BE.AEVersion < 10.5) {
        app.project.timecodeDisplayType = TimecodeDisplayType.FRAMES;
    } else {
        app.project.timeDisplayType = TimeDisplayType.FRAMES;
    }

    TB.equal(
        BE.time.getTimeDisplayTypeString(),
        "frames",
        "BE.time.getTimeDisplayTypeString() is frames."
    );

    //Set the timecode display type to timecode for the tst.
    if (BE.AEVersion < 10.5) {
        app.project.timecodeDisplayType = TimecodeDisplayType.TIMECODE;
    } else {
        app.project.timeDisplayType = TimeDisplayType.TIMECODE;
    }

    TB.equal(
        BE.time.getTimeDisplayTypeString(),
        "timecode",
        "BE.time.getTimeDisplayTypeString() is timecode."
    );

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.time.timeDisplayTypeIs()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp,
        testLayers = testConfig.comp.testLayers;

    //Set the timecode display type to frames and check.
    BE.time.setTimeDisplayType("frames");
    TB.ok(BE.time.timeDisplayTypeIs("frames"), "timeDisplayTypeIs(\"frames\") is correct!");

    //Set the timecode display type to frames and check.
    BE.time.setTimeDisplayType("FRAMES");
    TB.ok(BE.time.timeDisplayTypeIs("FRAMES"), "timeDisplayTypeIs(\"FRAMES\") is correct!");

    //Set the timecode display type to timecode and check.
    BE.time.setTimeDisplayType("timecode");
    TB.ok(BE.time.timeDisplayTypeIs("timecode"), "timeDisplayTypeIs(\"timecode\") is correct!");

    BE.time.setTimeDisplayType("TIMECODE");
    TB.ok(BE.time.timeDisplayTypeIs("TIMECODE"), "timeDisplayTypeIs(\"TIMECODE\") is correct!");

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.time.setTimeDisplayType()', function () {
    //Initialize the testConfig comp object
    testConfig.comp.init();

    var theComp = testConfig.comp.theComp,
        testLayers = testConfig.comp.testLayers;

    //Set the timecode display type to frames and check.
    BE.time.setTimeDisplayType("frames");
    TB.equal(BE.time.getTimeDisplayTypeString(), "frames", "Timecode display type is equal to frames.");

    //Set the timecode display type to timecode and check.
    BE.time.setTimeDisplayType("timecode");
    TB.equal(BE.time.getTimeDisplayTypeString(), "timecode", "Timecode display type is equal to timecode.");

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

TB.test('BE.time.withTimecodeRemembered()', function () {
    var theComp = testConfig.comp.theComp,
        timeDisplayTypeOutsideStart,
        timeDisplayTypeInside,
        timeDisplayTypeOutsideEnd;

    //Initialize the testConfig comp object
    testConfig.comp.init();

    BE.time.setTimeDisplayType("timecode");
    timeDisplayTypeOutsideStart = BE.time.getTimeDisplayTypeString();

    BE.time.withTimecodeRemembered("frames", function () {
        timeDisplayTypeInside = BE.time.getTimeDisplayTypeString();
    });

    timeDisplayTypeOutsideEnd = BE.time.getTimeDisplayTypeString();

    TB.equal(
        timeDisplayTypeInside,
        "frames",
        "Timecode set correctly within inner function."
    );

    TB.equal(
        timeDisplayTypeOutsideStart,
        timeDisplayTypeOutsideEnd,
        "Timecode remembered correctly."
    );

    //Clean up the testConfig comp object
    testConfig.comp.clean();
});

/** TODO: **/
