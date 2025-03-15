
> my-v0-project@0.1.0 test /Users/jerichowenzel/Desktop/hms
> vitest tests/appointment-test/


 DEV  v3.0.8 /Users/jerichowenzel/Desktop/hms

 ❯ tests/appointment-test/use-appointments.test.ts (0 test)
 ✓ tests/appointment-test/appointment-status-update.test.tsx (5 tests) 148ms
 ❯ tests/appointment-test/new-appointment-form.test.tsx (6 tests | 1 failed) 1091ms
   ✓ NewAppointmentForm > renders correctly when open
   ✓ NewAppointmentForm > does not render when closed
   ✓ NewAppointmentForm > calls onClose when cancel button is clicked
   ✓ NewAppointmentForm > displays department options correctly
   ✓ NewAppointmentForm > displays doctor options correctly
   × NewAppointmentForm > submits the form with correct data 1018ms
     → expected "spy" to be called at least once

Ignored nodes: comments, script, style
[36m<html>[39m
  [36m<head />[39m
  [36m<body>[39m
    [36m<div>[39m
      [36m<div[39m
        [33mdata-testid[39m=[32m"dialog"[39m
      [36m>[39m
        [36m<div[39m
          [33mdata-testid[39m=[32m"dialog-content"[39m
        [36m>[39m
          [36m<div[39m
            [33mdata-testid[39m=[32m"dialog-header"[39m
          [36m>[39m
            [36m<div[39m
              [33mdata-testid[39m=[32m"dialog-title"[39m
            [36m>[39m
              [0mSchedule New Appointment[0m
            [36m</div>[39m
            [36m<div[39m
              [33mdata-testid[39m=[32m"dialog-description"[39m
            [36m>[39m
              [0mFill out the form below to schedule a new appointment.[0m
            [36m</div>[39m
          [36m</div>[39m
          [36m<div[39m
            [33mdata-testid[39m=[32m"form"[39m
          [36m>[39m
            [36m<form[39m
              [33mclass[39m=[32m"space-y-6"[39m
            [36m>[39m
              [36m<div[39m
                [33mclass[39m=[32m"space-y-4"[39m
              [36m>[39m
                [36m<div[39m
                  [33mdata-testid[39m=[32m"form-field-patientId"[39m
                [36m>[39m
                  [36m<div[39m
                    [33mdata-testid[39m=[32m"form-item"[39m
                  [36m>[39m
                    [36m<div[39m
                      [33mdata-testid[39m=[32m"form-label"[39m
                    [36m>[39m
                      [0mPatient[0m
                    [36m</div>[39m
                    [36m<div[39m
                      [33mdata-testid[39m=[32m"popover"[39m
                    [36m>[39m
                      [36m<div[39m
                        [33mdata-testid[39m=[32m"popover-trigger"[39m
                      [36m>[39m
                        [36m<div[39m
                          [33mdata-testid[39m=[32m"form-control"[39m
                        [36m>[39m
                          [36m<button[39m
                            [33mdata-testid[39m=[32m"button"[39m
                          [36m>[39m
                            [0mSelect patient[0m
                            [36m<svg[39m
                              [33mclass[39m=[32m"lucide lucide-user ml-2 h-4 w-4 shrink-0 opacity-50"[39m
                              [33mfill[39m=[32m"none"[39m
                              [33mheight[39m=[32m"24"[39m
                              [33mstroke[39m=[32m"currentColor"[39m
                              [33mstroke-linecap[39m=[32m"round"[39m
                              [33mstroke-linejoin[39m=[32m"round"[39m
                              [33mstroke-width[39m=[32m"2"[39m
                              [33mviewBox[39m=[32m"0 0 24 24"[39m
                              [33mwidth[39m=[32m"24"[39m
                              [33mxmlns[39m=[32m"http://www.w3.org/2000/svg"[39m
                            [36m>[39m
                              [36m<path[39m
                                [33md[39m=[32m"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"[39m
                              [36m/>[39m
                              [36m<circle[39m
                                [33mcx[39m=[32m"12"[39m
                                [33mcy[39m=[32m"7"[39m
                                [33mr[39m=[32m"4"[39m
                              [36m/>[39m
                            [36m</svg>[39m
                          [36m</button>[39m
                        [36m</div>[39m
                      [36m</div>[39m
                      [36m<div[39m
                        [33mdata-testid[39m=[32m"popover-content"[39m
                      [36m>[39m
                        [36m<div[39m
                          [33mdata-testid[39m=[32m"command"[39m
                        [36m>[39m
                          [36m<input[39m
                            [33mdata-testid[39m=[32m"command-input"[39m
                            [33mplaceholder[39m=[32m"Search patient..."[39m
                          [36m/>[39m
                          [36m<div[39m
                            [33mdata-testid[39m=[32m"command-empty"[39m
                          [36m>[39m
                            [0mNo patient found.[0m
                          [36m</div>[39m
                          [36m<div[39m
                            [33mdata-testid[39m=[32m"command-group"[39m
                          [36m>[39m
                            [36m<div[39m
                              [33mdata-testid[39m=[32m"command-item-John Doe"[39m
                            [36m>[39m
                              [36m<svg[39m
                                [33mclass[39m=[32m"lucide lucide-check mr-2 h-4 w-4 opacity-0"[39m
                                [33mfill[39m=[32m"none"[39m
                                [33mheight[39m=[32m"24"[39m
                                [33mstroke[39m=[32m"currentColor"[39m
                                [33mstroke-linecap[39m=[32m"round"[39m
                                [33mstroke-linejoin[39m=[32m"round"[39m
                                [33mstroke-width[39m=[32m"2"[39m
                                [33mviewBox[39m=[32m"0 0 24 24"[39m
                                [33mwidth[39m=[32m"24"[39m
                                [33mxmlns[39m=[32m"http://www.w3.org/2000/svg"[39m
                              [36m>[39m
                                [36m<path[39m
                                  [33md[39m=[32m"M20 6 9 17l-5-5"[39m
                                [36m/>[39m
                              [36m</svg>[39m
                              [0mJohn[0m
                              [0m [0m
                              [0mDoe[0m
                            [36m</div>[39m
                            [36m<div[39m
                              [33mdata-testid[39m=[32m"command-item-Jane Smith"[39m
                            [36m>[39m
                              [36m<svg[39m
                                [33mclass[39m=[32m"lucide lucide-check mr-2 h-4 w-4 opacity-0"[39m
                                [33mfill[39m=[32m"none"[39m
                                [33mheight[39m=[32m"24"[39m
                                [33mstroke[39m=[32m"currentColor"[39m
                                [33mstroke-linecap[39m=[32m"round"[39m
                                [33mstroke-linejoin[39m=[32m"round"[39m
                                [33mstroke-width[39m=[32m"2"[39m
                                [33mviewBox[39m=[32m"0 0 24 24"[39m
                                [33mwidth[39m=[32m"24"[39m
                                [33mxmlns[39m=[32m"http://www.w3.org/2000/svg"[39m
                              [36m>[39m
            ...

 Test Files  2 failed | 1 passed (3)
      Tests  1 failed | 10 passed (11)
   Start at  22:54:39
   Duration  1.92s (transform 205ms, setup 327ms, collect 1.20s, tests 1.24s, environment 905ms, prepare 159ms)

 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
c[3J RERUN  tests/appointment-test/new-appointment-form.test.tsx x1 
        Filename pattern: tests/appointment-test/

 ❯ tests/appointment-test/use-appointments.test.ts (0 test)
 ❯ tests/appointment-test/new-appointment-form.test.tsx (6 tests | 1 failed) 337ms
   ✓ NewAppointmentForm > renders correctly when open
   ✓ NewAppointmentForm > does not render when closed
   ✓ NewAppointmentForm > calls onClose when cancel button is clicked
   ✓ NewAppointmentForm > displays department options correctly
   ✓ NewAppointmentForm > displays doctor options correctly
   × NewAppointmentForm > submits the form with correct data 81ms
     → Unable to find an element by: [data-testid="command-item-Dr. John Smith"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mdata-testid[39m=[32m"dialog"[39m
    [36m>[39m
      [36m<div[39m
        [33mdata-testid[39m=[32m"dialog-content"[39m
      [36m>[39m
        [36m<div[39m
          [33mdata-testid[39m=[32m"dialog-header"[39m
        [36m>[39m
          [36m<div[39m
            [33mdata-testid[39m=[32m"dialog-title"[39m
          [36m>[39m
            [0mSchedule New Appointment[0m
          [36m</div>[39m
          [36m<div[39m
            [33mdata-testid[39m=[32m"dialog-description"[39m
          [36m>[39m
            [0mFill out the form below to schedule a new appointment.[0m
          [36m</div>[39m
        [36m</div>[39m
        [36m<div[39m
          [33mdata-testid[39m=[32m"form"[39m
        [36m>[39m
          [36m<form[39m
            [33mclass[39m=[32m"space-y-6"[39m
          [36m>[39m
            [36m<div[39m
              [33mclass[39m=[32m"space-y-4"[39m
            [36m>[39m
              [36m<div[39m
                [33mdata-testid[39m=[32m"form-field-patientId"[39m
              [36m>[39m
                [36m<div[39m
                  [33mdata-testid[39m=[32m"form-item"[39m
                [36m>[39m
                  [36m<div[39m
                    [33mdata-testid[39m=[32m"form-label"[39m
                  [36m>[39m
                    [0mPatient[0m
                  [36m</div>[39m
                  [36m<div[39m
                    [33mdata-testid[39m=[32m"popover"[39m
                  [36m>[39m
                    [36m<div[39m
                      [33mdata-testid[39m=[32m"popover-trigger"[39m
                    [36m>[39m
                      [36m<div[39m
                        [33mdata-testid[39m=[32m"form-control"[39m
                      [36m>[39m
                        [36m<button[39m
                          [33mdata-testid[39m=[32m"button"[39m
                        [36m>[39m
                          [0mSelect patient[0m
                          [36m<svg[39m
                            [33mclass[39m=[32m"lucide lucide-user ml-2 h-4 w-4 shrink-0 opacity-50"[39m
                            [33mfill[39m=[32m"none"[39m
                            [33mheight[39m=[32m"24"[39m
                            [33mstroke[39m=[32m"currentColor"[39m
                            [33mstroke-linecap[39m=[32m"round"[39m
                            [33mstroke-linejoin[39m=[32m"round"[39m
                            [33mstroke-width[39m=[32m"2"[39m
                            [33mviewBox[39m=[32m"0 0 24 24"[39m
                            [33mwidth[39m=[32m"24"[39m
                            [33mxmlns[39m=[32m"http://www.w3.org/2000/svg"[39m
                          [36m>[39m
                            [36m<path[39m
                              [33md[39m=[32m"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"[39m
                            [36m/>[39m
                            [36m<circle[39m
                              [33mcx[39m=[32m"12"[39m
                              [33mcy[39m=[32m"7"[39m
                              [33mr[39m=[32m"4"[39m
                            [36m/>[39m
                          [36m</svg>[39m
                        [36m</button>[39m
                      [36m</div>[39m
                    [36m</div>[39m
                    [36m<div[39m
                      [33mdata-testid[39m=[32m"popover-content"[39m
                    [36m>[39m
                      [36m<div[39m
                        [33mdata-testid[39m=[32m"command"[39m
                      [36m>[39m
                        [36m<input[39m
                          [33mdata-testid[39m=[32m"command-input"[39m
                          [33mplaceholder[39m=[32m"Search patient..."[39m
                        [36m/>[39m
                        [36m<div[39m
                          [33mdata-testid[39m=[32m"command-empty"[39m
                        [36m>[39m
                          [0mNo patient found.[0m
                        [36m</div>[39m
                        [36m<div[39m
                          [33mdata-testid[39m=[32m"command-group"[39m
                        [36m>[39m
                          [36m<div[39m
                            [33mdata-testid[39m=[32m"command-item-John Doe"[39m
                          [36m>[39m
                            [36m<svg[39m
                              [33mclass[39m=[32m"lucide lucide-check mr-2 h-4 w-4 opacity-0"[39m
                              [33mfill[39m=[32m"none"[39m
                              [33mheight[39m=[32m"24"[39m
                              [33mstroke[39m=[32m"currentColor"[39m
                              [33mstroke-linecap[39m=[32m"round"[39m
                              [33mstroke-linejoin[39m=[32m"round"[39m
                              [33mstroke-width[39m=[32m"2"[39m
                              [33mviewBox[39m=[32m"0 0 24 24"[39m
                              [33mwidth[39m=[32m"24"[39m
                              [33mxmlns[39m=[32m"http://www.w3.org/2000/svg"[39m
                            [36m>[39m
                              [36m<path[39m
                                [33md[39m=[32m"M20 6 9 17l-5-5"[39m
                              [36m/>[39m
                            [36m</svg>[39m
                            [0mJohn[0m
                            [0m [0m
                            [0mDoe[0m
                          [36m</div>[39m
                          [36m<div[39m
                            [33mdata-testid[39m=[32m"command-item-Jane Smith"[39m
                          [36m>[39m
                            [36m<svg[39m
                              [33mclass[39m=[32m"lucide lucide-check mr-2 h-4 w-4 opacity-0"[39m
                              [33mfill[39m=[32m"none"[39m
                              [33mheight[39m=[32m"24"[39m
                              [33mstroke[39m=[32m"currentColor"[39m
                              [33mstroke-linecap[39m=[32m"round"[39m
                              [33mstroke-linejoin[39m=[32m"round"[39m
                              [33mstroke-width[39m=[32m"2"[39m
                              [33mviewBox[39m=[32m"0 0 24 24"[39m
                              [33mwidth[39m=[32m"24"[39m
                              [33mxmlns[39m=[32m"http://www.w3.org/2000/svg"[39m
                            [36m>[39m
                              [36m<path[39m
                                [33md[39m=[32m"M20 6 9 17l-5-5"[39m
                              [36m/>[39m
                            [36m</svg>[39m
                            [0mJane[0m
                            [0m [0m
                            [0mSmi...

 Test Files  2 failed (2)
      Tests  1 failed | 5 passed (6)
   Start at  22:56:27
   Duration  2.82s

 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
c[3J RERUN  tests/appointment-test/new-appointment-form.test.tsx x2 
        Filename pattern: tests/appointment-test/

 ❯ tests/appointment-test/use-appointments.test.ts (0 test)
 ✓ tests/appointment-test/new-appointment-form.test.tsx (6 tests) 429ms

 Test Files  1 failed | 1 passed (2)
      Tests  6 passed (6)
   Start at  22:58:03
   Duration  2.61s

 PASS  Waiting for file changes...
       press h to show help, press q to quit
c[3J RERUN  tests/appointment-test/new-appointment-form.test.tsx x3 
        Filename pattern: tests/appointment-test/

 ❯ tests/appointment-test/use-appointments.test.ts (0 test)
Cancelling test run. Press CTRL+c again to exit forcefully.


 Test Files  1 failed (2)
      Tests   (6)
     Errors  1 error
   Start at  22:59:17
   Duration  982ms

 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
 ELIFECYCLE  Test failed. See above for more details.
