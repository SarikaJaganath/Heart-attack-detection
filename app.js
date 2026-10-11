
const healthForm = document.getElementById("healthForm");
const results = document.getElementById("results");
const symptomBoxes = [
  ...document.querySelectorAll('input[name="symptoms"]')
];
const noSymptoms = document.getElementById("noSymptoms");

// Keep "no symptoms" mutually exclusive with symptom selections.
noSymptoms.addEventListener("change", () => {
  if (noSymptoms.checked) {
    symptomBoxes.forEach(box => box.checked = false);
  }
});

symptomBoxes.forEach(box => {
  box.addEventListener("change", () => {
    if (box.checked) noSymptoms.checked = false;
  });
});

function addText(parent, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function showResults(className) {
  results.hidden = false;
  results.className = "panel results " + className;
  results.replaceChildren();
}

function showError(message, id) {
  alert(message);
  const field = document.getElementById(id);

  if (field) {
    field.focus({ preventScroll: true });
    field.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

function scrollResults() {
  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// Health assessment
healthForm.addEventListener("submit", event => {
  event.preventDefault();

  const selected = symptomBoxes
    .filter(box => box.checked)
    .map(box => box.value);

  // Emergency-first handling. Do not show a risk score.
  if (selected.length > 0) {
    showResults("result-emergency");

    addText(results, "h3", "⚠ Seek Emergency Medical Care");

    addText(
      results,
      "p",
      "You selected possible heart attack symptoms. These can have different causes, but may indicate an emergency. If you suspect a heart attack, call 112 in India now. Do not wait for an online result."
    );

    addText(results, "h4", "Symptoms selected:");

    const list = document.createElement("ul");

    selected.forEach(item => {
      addText(list, "li", item);
    });

    results.appendChild(list);

    addText(
      results,
      "p",
      "Do not drive yourself. Follow the emergency dispatcher's instructions."
    );

    const call = document.createElement("a");
    call.href = "tel:112";
    call.className = "danger-btn";
    call.textContent = "Call 112 — India";
    results.appendChild(call);

    scrollResults();
    return;
  }

  if (!noSymptoms.checked) {
    showError(
      "Please select any symptoms you have, or choose the no-symptoms option.",
      "symptoms"
    );
    return;
  }

  const required = [
    ["age", "Please enter your age."],
    ["sex", "Please select an option for sex."],
    ["systolic", "Please enter systolic blood pressure."],
    ["diastolic", "Please enter diastolic blood pressure."],
    ["cholesterol", "Please enter total cholesterol."],
    ["heartRate", "Please enter resting heart rate."],
    ["diabetes", "Please answer the diabetes question."],
    ["smoking", "Please answer the smoking question."],
    ["family", "Please answer the family history question."]
  ];

  for (const [id, message] of required) {
    const field = document.getElementById(id);

    if (!field.value || !field.checkValidity()) {
      showError(message, id);
      return;
    }
  }

  const age = Number(document.getElementById("age").value);
  const systolic = Number(
    document.getElementById("systolic").value
  );
  const diastolic = Number(
    document.getElementById("diastolic").value
  );
  const cholesterol = Number(
    document.getElementById("cholesterol").value
  );
  const heartRate = Number(
    document.getElementById("heartRate").value
  );

  const diabetes = document.getElementById("diabetes").value;
  const smoking = document.getElementById("smoking").value;
  const family = document.getElementById("family").value;

  if (systolic <= diastolic) {
    showError(
      "Please check blood pressure: systolic should be greater than diastolic.",
      "systolic"
    );
    return;
  }

  showResults("result-info");

  addText(results, "h3", "Your Heart Health Summary");

  addText(
    results,
    "p",
    "You reported no listed symptoms at this time. This does not rule out a heart problem or guarantee safety. This is an educational review, not a diagnosis."
  );

  addText(results, "h4", "Your entered information");

  const entered = document.createElement("ul");

  [
    `Age: ${age} years`,
    `Blood pressure: ${systolic}/${diastolic} mmHg`,
    `Total cholesterol: ${cholesterol} mg/dL`,
    `Resting heart rate: ${heartRate} bpm`
  ].forEach(item => addText(entered, "li", item));

  results.appendChild(entered);

  addText(results, "h4", "Factors to discuss with a clinician");

  const factors = [];

  if (systolic >= 130 || diastolic >= 80) {
    factors.push(
      "Your blood pressure reading may warrant review. Discuss persistently elevated readings with a healthcare professional."
    );
  }

  if (cholesterol >= 200) {
    factors.push(
      "Discuss your cholesterol and a complete lipid profile with a healthcare professional."
    );
  }

  if (diabetes === "yes") {
    factors.push(
      "Diabetes is an important cardiovascular risk factor."
    );
  }

  if (smoking === "yes" || smoking === "former") {
    factors.push(
      "Current or past smoking is relevant to cardiovascular health."
    );
  }

  if (family === "yes") {
    factors.push(
      "Tell your clinician about family history of early heart disease."
    );
  }

  if (age >= 45) {
    factors.push(
      "Age is one of several factors considered in cardiovascular risk assessment."
    );
  }

  if (heartRate < 60 || heartRate > 100) {
    factors.push(
      "Your resting heart rate is outside the commonly cited adult range of 60–100 bpm. Fitness, medicines and other factors can affect it."
    );
  }

  if (factors.length > 0) {
    const factorList = document.createElement("ul");

    factors.forEach(item => {
      addText(factorList, "li", item);
    });

    results.appendChild(factorList);
  } else {
    addText(
      results,
      "p",
      "These simple rules did not identify a review prompt. That does not mean your cardiovascular risk is low."
    );
  }

  addText(
    results,
    "p",
    "Arrange an appropriate clinical assessment. If symptoms develop, seek urgent medical care rather than relying on this website."
  );

  scrollResults();
});

// Choose a directory listing and move to the appointment form.
document.querySelectorAll(".choose-doctor").forEach(button => {
  button.addEventListener("click", () => {
    document.getElementById("doctorId").value =
      button.dataset.doctor;

    document.getElementById("appointmentForm").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

// Do not allow selection of a past appointment date.
const dateInput = document.getElementById("preferredDate");
dateInput.min = new Date().toISOString().slice(0, 10);

// This frontend demo previews the form only.
// It does not save, email or book appointments.
const appointmentForm =
  document.getElementById("appointmentForm");

const appointmentMessage =
  document.getElementById("appointmentMessage");

appointmentForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!appointmentForm.reportValidity()) return;

  const values = Object.fromEntries(
    new FormData(appointmentForm).entries()
  );

  const doctorText =
    document.getElementById("doctorId")
      .selectedOptions[0].textContent;

  appointmentMessage.replaceChildren();

  addText(appointmentMessage, "h3", "Demo request preview");
  addText(appointmentMessage, "p", `Name: ${values.patientName}`);
  addText(appointmentMessage, "p", `Preferred listing: ${doctorText}`);

  addText(
    appointmentMessage,
    "p",
    `Preferred date: ${values.preferredDate} · Time: ${values.preferredTime}`
  );

  addText(
    appointmentMessage,
    "p",
    "This is only a local preview. No request has been saved, sent to a doctor or booked."
  );

  appointmentMessage.hidden = false;
  appointmentMessage.className = "message";

  appointmentMessage.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});
