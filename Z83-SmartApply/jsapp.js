const profileStorageKey = "z83UserProfile";

/* LOGIN AND SIGN UP */

function createAccount() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (!loginForm || !signupForm) return;

    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");

    document.getElementById("signupLink").classList.add("hidden");
    document.getElementById("loginLink").classList.remove("hidden");

    document.getElementById("formTitle").textContent = "Create Your Account";
    document.getElementById("formText").textContent =
        "Create a profile to start your Z83 application.";
}

function showLogin() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (!loginForm || !signupForm) return;

    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

    document.getElementById("loginLink").classList.add("hidden");
    document.getElementById("signupLink").classList.remove("hidden");

    document.getElementById("formTitle").textContent = "Welcome Back";
    document.getElementById("formText").textContent =
        "Sign in to continue your application.";
}

function getSavedProfile() {
    try {
        return JSON.parse(
            localStorage.getItem(profileStorageKey) || "{}"
        );
    } catch {
        return {};
    }
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        localStorage.setItem("z83LoggedIn", "true");
        window.location.href = "profile.html";
    });
}

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();

        localStorage.setItem(
            profileStorageKey,
            JSON.stringify({
                fullName: fullName,
                email: email
            })
        );

        localStorage.setItem("z83LoggedIn", "true");
        window.location.href = "profile.html";
    });
}

/* PROFILE PAGE */

const profileForm = document.getElementById("profileForm");

if (profileForm) {
    const savedProfile = getSavedProfile();

    profileForm.querySelectorAll("input, textarea, select").forEach(function (field) {
        if (savedProfile[field.id]) {
            field.value = savedProfile[field.id];
        }
    });

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const profile = {};

        profileForm.querySelectorAll("input, textarea, select").forEach(function (field) {
            profile[field.id] = field.value.trim();
        });

        localStorage.setItem(
            profileStorageKey,
            JSON.stringify(profile)
        );

        document.getElementById("saveMessage").textContent =
            "Profile saved. Opening your Z83 application...";

        setTimeout(function () {
            window.location.href = "z83.html";
        }, 1000);
    });
}

/* Z83 OVERLAY PAGE */

const z83JobAdvert = document.getElementById("jobAdvert");

if (z83JobAdvert) {
    const savedProfile = getSavedProfile();

    function fillField(fieldId, value) {
        const field = document.getElementById(fieldId);

        if (field) {
            field.value = value || "";
        }
    }

    function loadProfileOnZ83() {
        fillField("z83FullName", savedProfile.fullName);
        fillField("z83DateOfBirth", savedProfile.dateOfBirth);
        fillField("z83IdNumber", savedProfile.idNumber);
        fillField("z83Email", savedProfile.email);
        fillField("z83Language", savedProfile.language);
        fillField("nationality", savedProfile.citizenship);
        fillField("z83Qualifications", savedProfile.qualifications);
        fillField("z83Experience", savedProfile.experience);
        fillField("z83References", savedProfile.references);

        function fillByName(fieldName, value) {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) field.value = value || "";
        }

        fillByName("passport_number", savedProfile.passportNumber);
        fillByName("nationality", savedProfile.nationality || savedProfile.citizenship);
        fillByName("private_sector_years", savedProfile.privateExperience);
        fillByName("public_sector_years", savedProfile.publicExperience);
        fillByName("language1", savedProfile.language1 || savedProfile.language);
        fillByName("language1_speak", savedProfile.language1Level);
        fillByName("language1_read", savedProfile.language1Level);
        fillByName("language2", savedProfile.language2);
        fillByName("language2_speak", savedProfile.language2Level);
        fillByName("language2_read", savedProfile.language2Level);
        fillByName("qualification_1", savedProfile.qualifications);
        fillByName("current_study", savedProfile.currentStudy);
        fillByName("post_1", savedProfile.experience);
        fillByName("reference_name_1", savedProfile.references);

        const selectMap = {
            race: savedProfile.race,
            gender: savedProfile.gender,
            disability: savedProfile.disability,
            workpermit_yes: savedProfile.workPermit === "Yes" ? "true" : "",
            criminal_yes: savedProfile.criminalRecord === "Yes" ? "true" : "",
            pending_criminal_yes: savedProfile.pendingCriminal === "Yes" ? "true" : "",
            dismissed_yes: savedProfile.dismissed === "Yes" ? "true" : "",
            disciplinary_yes: savedProfile.disciplinary === "Yes" ? "true" : "",
            state_business_yes: savedProfile.stateBusiness === "Yes" ? "true" : ""
        };

        Object.entries(selectMap).forEach(function ([fieldName, value]) {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (!field) return;
            if (field.type === "checkbox") field.checked = value === "true";
            else field.value = value;
        });

        const citizenYes = document.getElementById("citizenYes");
        const citizenNo = document.getElementById("citizenNo");

        if ((savedProfile.citizenship || "").toLowerCase()
            .includes("south african")) {
            if (citizenYes) citizenYes.checked = true;
            if (citizenNo) citizenNo.checked = false;
        }
    }

    function extractAdvertDetails(advert) {
        const source = advert.replace(/\r/g, "");

        const postMatch = source.match(
            /^\s*POST\s+\d+\/\d+\s*:\s*(.+)$/im
        );

        const directorateMatch = source.match(
            /Directorate\s*:\s*(.+)$/im
        );

        const centreMatch = source.match(
            /CENTRE\s*:\s*(.+?)(?=\s*Ref\s*(?:No|Number)?\.?\s*:|$)/im
        );

        const referenceMatch = source.match(
            /Ref\s*(?:No|Number)?\.?\s*:\s*(.+?)(?:\s*\(X?\d+\s*Posts?\)|$)/im
        );

        let position = postMatch ? postMatch[1].trim() : "Not found";

        position = position.replace(
            /\s*\(X?\d+\s*Posts?\)\s*$/i,
            ""
        );

        return {
            position: position,
            department: directorateMatch
                ? directorateMatch[1].trim()
                : "Not found",
            centre: centreMatch
                ? centreMatch[1].trim()
                : "Not found",
            reference: referenceMatch
                ? referenceMatch[1].trim()
                : "Not found"
        };
    }

    function saveZ83Fields() {
        const z83Data = {};

        document.querySelectorAll(".page input").forEach(function (field) {
            if (field.type === "checkbox") {
                z83Data[field.name] = field.checked;
            } else {
                z83Data[field.name] = field.value;
            }
        });

        localStorage.setItem("z83FormData", JSON.stringify(z83Data));
    }

    function loadSavedZ83Fields() {
        try {
            const z83Data = JSON.parse(
                localStorage.getItem("z83FormData") || "{}"
            );

            document.querySelectorAll(".page input").forEach(function (field) {
                if (!(field.name in z83Data)) return;

                if (field.type === "checkbox") {
                    field.checked = z83Data[field.name];
                } else {
                    field.value = z83Data[field.name];
                }
            });
        } catch {
            /* Ignore invalid saved form data. */
        }
    }

    loadSavedZ83Fields();
    loadProfileOnZ83();

    document.querySelectorAll(".page input").forEach(function (field) {
        field.addEventListener("input", saveZ83Fields);
        field.addEventListener("change", saveZ83Fields);
    });

    const loadZ83Button = document.getElementById("loadZ83Btn");

    if (loadZ83Button) {
        loadZ83Button.addEventListener("click", function () {
            const advert = z83JobAdvert.value.trim();
            const message = document.getElementById("z83Message");

            if (!advert) {
                message.textContent = "Please paste a job advert first.";
                return;
            }

            const job = extractAdvertDetails(advert);

            fillField("position", job.position);
            fillField("department", job.department);
            fillField("referenceNumber", job.reference);

            localStorage.setItem("z83Centre", job.centre);
            saveZ83Fields();

            message.textContent =
                "Your saved profile and job advert details are loaded on the Z83.";
        });
    }
}
