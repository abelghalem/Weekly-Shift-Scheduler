/* ========= Utility helpers - Basic helper functions ========= */
// const fmt  = d => d.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
console.log(
  "%c Made with ❤️ by Suraj Khanna ",
  "color:#5b7cfa; font-size:14px; font-weight:bold;"
)

// Date ko US format mein convert karta hai - makes date look like "4 Sep 2025"
const fmt = (dateToFormat) =>
  dateToFormat.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

// Day of week nikalta hai - like "Monday", "Tuesday" etc
const dow = (dateToCheck) => dateToCheck.toLocaleDateString("en-IN", { weekday: "long" })

// Array se random item pick karta hai - jaise lucky draw
const pick = (arrayToPickFrom) => arrayToPickFrom[(Math.random() * arrayToPickFrom.length) | 0]

// Array ko shuffle karta hai - cards shuffle karne jaisa
const shuffle = (arrayToShuffle) => [...arrayToShuffle].sort(() => Math.random() - 0.5)

// Do dates same hai ya nahi check karta hai
const same = (firstDate, secondDate) => firstDate && secondDate && firstDate.getTime() === secondDate.getTime()

/* ========= Fixed staff - Permanent employee list for cloning ========= */
const Departments = {
  Service: ["Jamilatou", "Nuray", "Yaëlle"],
}

/* ========= Split month into weeks - Month ko weeks mein baantna ========= */
function splitWeeks(yearToSplit, monthToSplit) {
  const monthLength = new Date(yearToSplit, monthToSplit + 1, 0).getDate() // Month mein kitne din hai
  const allDaysInMonth = [], // Saare din store karne ke liye
        weeksArray = [], // Final weeks array
        currentWeek = [] // Current week building karne ke liye
  
  // Month ke saare dates banao
  for (let dayNumber = 1; dayNumber <= monthLength; dayNumber++) {
    allDaysInMonth.push(new Date(yearToSplit, monthToSplit, dayNumber))
  }

  // Har day check karo and weeks banao
  allDaysInMonth.forEach((currentDate) => {
    currentWeek.push(currentDate)
    if (currentDate.getDay() === 0) {
      // Sunday hai matlab week khatam - Sunday → end of week
      weeksArray.push(currentWeek.slice()) // Copy banao current week ka
      currentWeek.length = 0 // Array clear karo
    }
  })

  // Agar last week incomplete hai, toh next month se days add karo until Sunday
  if (currentWeek.length) {
    let nextMonthDate = new Date(yearToSplit, monthToSplit + 1, 1)
    while (nextMonthDate.getDay() !== 0) {
      // Sunday tak add karte raho
      currentWeek.push(new Date(nextMonthDate))
      nextMonthDate.setDate(nextMonthDate.getDate() + 1)
    }
    currentWeek.push(new Date(nextMonthDate)) // Sunday bhi include karo
    weeksArray.push(currentWeek)
  }
  return weeksArray
}

/* ========= Build table - HTML table banane ke liye ========= */
// Department names ko proper labels deta hai
const depLabel = (departmentName) =>
  ({
    Service: "Service",
  }[departmentName])

// Week ka complete HTML table banata hai
function tableHTML(weekDays, weekScheduleObject, weekIndex) {
  const scheduleData = weekScheduleObject.data
  
  // Table headers banao - department aur employee names ke liye
  const topHeaders = [
    '<th rowspan="2">Department</th><th rowspan="2">Name of Employee</th>',
  ]
  const dateHeaders = []
  
  // Har din ke liye headers add karo
  weekDays.forEach((currentDay) => {
    topHeaders.push(`<th>${dow(currentDay)}</th>`) // Day name like Monday
    dateHeaders.push(`<th>${fmt(currentDay)}</th>`) // Date like 4 Sep
  })
  
  const tableHead = `<thead><tr>${topHeaders.join("")}</tr><tr>${dateHeaders.join("")}</tr></thead>`
  const tableRows = []
  
  // Department wise rows banane ka function
  const createDepartmentBlock = (deptName, employeeArray) =>
    employeeArray.forEach((personName, employeeIndex) => {
      const rowCells = []
      
      // Pehla employee hai toh department name add karo
      if (employeeIndex === 0)
        rowCells.push(
          `<th class="dept" rowspan="${employeeArray.length}">${depLabel(deptName)}</th>`
        )
      
      rowCells.push(`<th>${personName}</th>`) // Employee name
      
      // Har din ke liye schedule add karo
      weekDays.forEach((dayToCheck) =>
        rowCells.push(`<td>${scheduleData[deptName][personName][fmt(dayToCheck)] || ""}</td>`)
      )
      tableRows.push(`<tr>${rowCells.join("")}</tr>`)
    })

  // Saare departments ke blocks banao
  createDepartmentBlock("Service", weekScheduleObject.Service)

  return `<section class="card week" data-w="${weekIndex}">
    <div style="margin-bottom:8px"><span class="badge t-7">Week ${weekIndex}</span>
      <small class="muted">(${fmt(weekDays[0])} → ${fmt(weekDays.at(-1))})</small>
    </div><br> <div class="table-wrap"> <table>${tableHead}<tbody>${tableRows.join(
    ""
  )}</tbody></table> </div> </section>`
}

/* ========= Render month - Pura month display karna ========= */
function renderMonth(yearToRender, monthToRender) {
  const monthWeeks = splitWeeks(yearToRender, monthToRender),
        mainContainer = document.getElementById("weeks"),
        tabsContainer = document.getElementById("tabs")
  
  // Containers clear karo
  mainContainer.innerHTML = ""
  tabsContainer.innerHTML = ""
  
  // Har week ke liye table aur tab banao
  monthWeeks.forEach((weekDays, weekIndex) => {
    const weekSchedule = buildWeek(weekDays)
    mainContainer.insertAdjacentHTML("beforeend", tableHTML(weekDays, weekSchedule, weekIndex + 1))
    tabsContainer.insertAdjacentHTML(
      "beforeend",
      `<button class="tab" data-w="${weekIndex + 1}">Week ${weekIndex + 1}</button>`
    )
  })
  
  // Current week find karo and activate karo
  const todayDate = new Date(),
        currentWeekIndex =
          todayDate.getFullYear() === yearToRender && todayDate.getMonth() === monthToRender
            ? monthWeeks.findIndex((weekToCheck) =>
                weekToCheck.some((dayToCheck) => dayToCheck.getDate() === todayDate.getDate())
              ) + 1
            : 1
            
  activate(currentWeekIndex)
  
  // Tab click handlers
  tabsContainer.onclick = (clickEvent) => {
    const weekNumber = clickEvent.target.dataset.w
    weekNumber && activate(+weekNumber)
  }
}

// Particular week ko active karta hai
function activate(weekNumber) {
  // Saare tabs se active class hatao, selected wale mein lagao
  document
    .querySelectorAll(".tab")
    .forEach((tabElement) => tabElement.classList.toggle("active", +tabElement.dataset.w === weekNumber))
    
  // Saare weeks hide karo, selected wala show karo
  document
    .querySelectorAll(".week")
    .forEach((weekElement) => weekElement.classList.toggle("hidden", +weekElement.dataset.w !== weekNumber))
}

/* ========= Excel export - Excel file download karne ke liye ========= */
function download() {
  const currentTable = document.querySelector(".week:not(.hidden) table")
  if (!currentTable) return // Koi table nahi mili toh return

  // Week name nikalo
  let weekNameForFile =
    document.querySelector(".tab.active")?.textContent.trim() ||
    document
      .querySelector(".week:not(.hidden) .badge.t-7")
      ?.textContent.trim() ||
    "Week"

  // Current date and time nikalo filename ke liye
  const currentDateTime = new Date()
  const padNumber = (numberToPad) => String(numberToPad).padStart(2, "0")
  const dateStringForFile = `${padNumber(currentDateTime.getDate())} ${currentDateTime.toLocaleString("en-US", {
    month: "short",
  })} ${currentDateTime.getFullYear()}`
  
  // Time formatting - 12 hour format
  let hourFor12Format = currentDateTime.getHours(),
      minutesFormatted = padNumber(currentDateTime.getMinutes())
  const amPmIndicator = hourFor12Format >= 12 ? "PM" : "AM"
  hourFor12Format = hourFor12Format % 12
  if (hourFor12Format === 0) hourFor12Format = 12
  const timeStringForFile = `${padNumber(hourFor12Format)}.${minutesFormatted} ${amPmIndicator}`
  
  // Final filename banao
  const filenameToSave = `${weekNameForFile} - ${dateStringForFile} - ${timeStringForFile}.xls`

  // Excel ke liye styling - fancy colors aur formatting
  const excelStyling = `
    <style>
      body { background:#1e263d; margin:0; }
      table { margin: 36px auto; background: #262f49; border-radius: 18px; border-collapse: separate !important; border-spacing: 0; box-shadow: 0 6px 40px #0006; font-family: 'Poppins',Segoe UI,Arial,sans-serif; }
      thead th { background: linear-gradient(90deg,#33408e,#5b7cfa 60%,#30c9e8); font-size: 1.08rem; color: #f3f7ff; border-right: 1.5px solid #253a65; border-bottom: 2.5px solid #3c6ee0; padding:14px 12px; letter-spacing: 0.9px; font-weight: bold; text-align:center; }
      thead tr:nth-child(2) th { background: #21305b; color: #dbeafe; font-weight: 600; border-bottom:1.5px solid #4f5bbd; }
      tbody th { background:#212a3d; color:#ffe2f1; font-weight: bold; text-align:left; padding:12px; border-right:1px solid #313970; border-bottom:1px solid #2c335a; }
      tbody td { padding:11px 6px; color:#f3f7ff; text-align:center; font-size:1.03rem; border-right:1px solid #313970; border-bottom:1px solid #242b4f; background: rgba(35, 45, 63, 0.91); }
      tbody tr:nth-child(even) td { background:#293354; }
      .badge, .off { border-radius:8px; padding:5px 9px; font-weight:600; display:inline-block; font-size:1.06rem; text-align:center; }
      .badge { background: #4750b4; color: #fff; }
      .off   { color:#ec6174; background:rgba(240,51,80,.12); border:1px dashed #e67397; }
      section { display:flex; flex-direction:column; align-items:center; }
    </style>
  `

  // Complete HTML banao Excel ke liye
  const htmlForExcel = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8">${excelStyling}</head>
      <body>
        <section>
          <div style="margin-bottom:17px; font-size:1.18rem; color:#95b8ff; font-weight:600; letter-spacing:0.7px;">
            ${weekNameForFile} | Exported on ${dateStringForFile} ${timeStringForFile}
          </div>
          ${currentTable.outerHTML}
        </section>
      </body>
    </html>
  `

  // File download karo
  const excelBlob = new Blob([htmlForExcel], { type: "application/vnd.ms-excel" })
  const downloadLink = document.createElement("a")
  downloadLink.href = URL.createObjectURL(excelBlob)
  downloadLink.download = filenameToSave
  downloadLink.click()
}

/* ========= Animated button helpers - Button animations ke liye ========= */
function setButtonLoading(buttonElement, loadingText, emojiForLoading = "🔄", animationStyle = "spin") {
  // Agar button already loading hai toh return
  if (buttonElement.dataset.loading === "true") return
  buttonElement.dataset.loading = "true"
  buttonElement.classList.add("loading")

  // Original text save karo
  const originalButtonText = buttonElement.dataset.originalText || buttonElement.textContent
  buttonElement.dataset.originalText = originalButtonText

  let dotCounter = 0
  buttonElement.innerHTML = `<span class="spinner-${animationStyle}">${emojiForLoading}</span> ${loadingText}`

  // Dots animation - har 500ms mein dots change karo
  const dotInterval = setInterval(() => {
    dotCounter = (dotCounter + 1) % 4
    buttonElement.innerHTML = `<span class="spinner-${animationStyle}">${emojiForLoading}</span> ${loadingText}${".".repeat(
      dotCounter
    )}`
  }, 500)

  // Success function return karo
  return (successMessage = "✅ Done!") => {
    clearInterval(dotInterval)
    buttonElement.textContent = successMessage
    buttonElement.classList.remove("loading")
    // 1.5 second baad original text wapas lao
    setTimeout(() => {
      buttonElement.textContent = originalButtonText
      buttonElement.dataset.loading = "false"
    }, 1500)
  }
}

/* ========= Buttons & bootstrap - Button events aur initial load ========= */
// Regenerate button - Nayi schedule banane ke liye
document.getElementById("regen").onclick = () => {
  const regenButton = document.getElementById("regen")
  const finishLoading = setButtonLoading(regenButton, "Regenerating", "🔄", "spin")
  setTimeout(() => {
    renderMonth(currentDate.getFullYear(), currentDate.getMonth())
    finishLoading("✅ Roster Ready!")
  }, 1200)
}

// Download button - Excel download ke liye
document.getElementById("dl").onclick = () => {
  const downloadButton = document.getElementById("dl")
  const finishDownload = setButtonLoading(downloadButton, "Downloading", "⬇️", "bounce")
  setTimeout(() => {
    download()
    finishDownload("✅ Downloaded!")
  }, 1200)
}

// Page load hote hi current month ka schedule banao
const currentDate = new Date()
renderMonth(currentDate.getFullYear(), currentDate.getMonth())

// Main buildWeek function - Ek week ka complete schedule banata hai
function buildWeek(weekDays) {
  // Staff array banao - original list se copy karo aur sort karo
  let serviceStaffList = [...Departments.Service].sort()

  // Schedule object banao - har employee ke liye
  const scheduleObject = { Service: {} }
  serviceStaffList.forEach((personName) => (scheduleObject.Service[personName] = {}))

  // Unique off days assign karne ka function
  function assignUniqueOffs(staffArray, availableDays) {
    let offsObject = {}
    let daysAvailable = [...availableDays]
    staffArray.forEach((employeeName) => {
      if (daysAvailable.length === 0) daysAvailable = [...availableDays]
      let selectedDay = pick(daysAvailable)
      offsObject[employeeName] = selectedDay
      daysAvailable = daysAvailable.filter((dayToCheck) => !same(dayToCheck, selectedDay))
    })
    return offsObject
  }

  const offDays = assignUniqueOffs(serviceStaffList, [...weekDays])

  // Helper functions
  const putSchedule = (departmentName, employeeName, dayDate, scheduleValue) =>
    (scheduleObject[departmentName][employeeName][fmt(dayDate)] = scheduleValue)

  const createBadge = (cssClass, displayText) => `<span class="badge ${cssClass}">${displayText}</span>`

  const OFF_DISPLAY = '<span class="off">Week&nbsp;Off</span>'

  const timeSlots = ["7", "2", "N"]
  const timeSlotClasses = { 7: "t-7", 2: "t-2", N: "t-N" }

  // Har din ka schedule fill karo
  weekDays.forEach((currentDay, dayIndex) => {
    serviceStaffList.forEach((employeeName, employeeIndex) => {
      if (same(currentDay, offDays[employeeName])) {
        putSchedule("Service", employeeName, currentDay, OFF_DISPLAY)
      } else {
        // Rotate time slots based on day and employee index
        const assignedSlot = timeSlots[(employeeIndex + dayIndex) % timeSlots.length]
        putSchedule("Service", employeeName, currentDay, createBadge(timeSlotClasses[assignedSlot], assignedSlot))
      }
    })
  })

  // Final week object return karo
  return {
    Service: serviceStaffList,
    data: scheduleObject,
  }
}
