// JS OF THE NOTIFICATIONS
(function () {
  // CSS of the container of the notifications 
  let container = document.getElementById("lead-inactivity-notifications");
  if (!container) {
    container = document.createElement("div");
    container.id = "lead-inactivity-notifications";
    Object.assign(container.style, {
      position: "fixed",
      bottom: "10px",
      right: "0px",
      width: "320px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column-reverse",
      gap: "10px",
      fontFamily: "'TikTok Sans', Arial, sans-serif",
      maxHeight: "380px",
      borderRadius: "7px",
      overflowY: "auto",
      padding: "10px"
    });
    document.body.appendChild(container);

    const fontStyle = document.createElement("style");
    fontStyle.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap');
    `;
    document.head.appendChild(fontStyle);

    const scrollbarStyle = document.createElement("style");
    scrollbarStyle.textContent = `
      #lead-inactivity-notifications {
        scrollbar-width: none; /* Firefox */
      }
      #lead-inactivity-notifications::-webkit-scrollbar {
        display: none; /* Chrome, Safari */
      }
    `;
    document.head.appendChild(scrollbarStyle);
  }

  // To prevent that every time you refresh the page you recieve all of the alerts, we save the ignored messages in the sessionStorage 
  function getIgnoredLeads() {
    const ignored = sessionStorage.getItem("ignoredLeads");
    return ignored ? JSON.parse(ignored) : [];
  }

  function addIgnoredLead(id) {
    const ignored = getIgnoredLeads();
    if (!ignored.includes(id)) {
      ignored.push(id);
      sessionStorage.setItem("ignoredLeads", JSON.stringify(ignored));
    }
  }
  
  // send a push notification 
  let notificationWindow = null
  function pushDesktopNotifications(lead, text, type) {
    const ignored = sessionStorage.getItem("ignored") === "true";
    if (ignored) return;

    function showNotification() {
        const notification = new Notification(type, {
            body: "New Unread Emails",
            icon: "https://img.utdstc.com/icon/390/bef/390bef65bfd085818f4e1bb65eea8ad81d8eaef33f8c5cf45179c43543aa9ca8:200",
        });

        notification.onclick = function () {
            const url = `https://221e.odoo.com/odoo/action-215/${lead.id}`;

            if (notificationWindow && !notificationWindow.closed) {
                notificationWindow.focus();
                notificationWindow.location.href = url;
            } else {
                notificationWindow = window.open(url);
                if (notificationWindow) {
                    notificationWindow.focus();
                }
            }
        };

        sessionStorage.setItem("ignored", "true");
    }

    if (Notification.permission === "granted") {
        showNotification();
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                showNotification();
            }
        });
    }
  }

  // CSS and the creation of the notifications
  function createNotification(lead, messaggio, typeOfOpp = "Lead") {
    if (getIgnoredLeads().includes(lead.id)) return;
    if (messaggio === null) return;

    const notif = document.createElement("div");
    notif.style = `
      background: #fff;
      border: 1px solid #dadada;
      padding: 12px;
      border-radius: 8px 8px 0 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      font-size: 14px;
    `;
    const title = document.createElement("div");
    title.textContent = `${lead.name || "(senza nome)"}`;
    title.style = "font-weight: bold; margin-bottom: 6px;";
    notif.appendChild(title);

    const info = document.createElement("div");
    info.textContent = messaggio;
    notif.appendChild(info);

    const btnContainer = document.createElement("div");
    btnContainer.style = "margin-top: 10px; display: flex; gap: 8px; justify-content: flex-end;";

    const btnPorta = document.createElement("button");
    btnPorta.textContent = "Take me to the " + typeOfOpp;
    btnPorta.style = `
      background-color: #714B67;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 6px 10px;
      cursor: pointer;
      font-weight: 600;
    `;
    btnPorta.onclick = () => {
      addIgnoredLead(lead.id);
      window.location.href = "https://221e.odoo.com/odoo/action-215/" + lead.id;
    };
    btnContainer.appendChild(btnPorta);

    const btnIgnora = document.createElement("button");
    btnIgnora.textContent = "Ignore";
    btnIgnora.style = `
      background-color: #e7e9ed;
      color: #374151;
      border: none;
      border-radius: 3px;
      padding: 6px 10px;
      cursor: pointer;
      font-weight: 600;
    `;
    btnIgnora.onclick = () => {
      container.removeChild(notif);
      addIgnoredLead(lead.id);
    };
    btnContainer.appendChild(btnIgnora);

    notif.appendChild(btnContainer);
    container.appendChild(notif);
  }

  // Check if there are any inactive leads
  function checkUnactiveLeads() {
    fetch("https://221e.odoo.com/web/dataset/call_kw/crm.lead/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "crm.lead",
          method: "search",
          args: [[]],
          kwargs: {
            context: {
              lang: "it_IT",
              tz: "Europe/Rome",
              uid: 2,
              allowed_company_ids: [1],
            },
          },
        },
        id: 1,
      }),
    })
      .then((res) => res.json())
      .then((searchData) => {
        const ids = searchData.result;
        if (!Array.isArray(ids) || ids.length === 0) return [];
        return fetch(
          "https://221e.odoo.com/web/dataset/call_kw/crm.lead/web_read",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "call",
              params: {
                model: "crm.lead",
                method: "web_read",
                args: [ids],
                kwargs: {
                  context: {
                    lang: "it_IT",
                    tz: "Europe/Rome",
                    uid: 2,
                    allowed_company_ids: [1],
                    default_type: "lead",
                  },
                  specification: {
                    won_status: {},
                    name: {},
                    type: {},
                    message_ids: {
                      fields: {
                        author_id: { fields: { display_name: {} } },
                        email_from: {},
                        date: {},
                        message_type: {},
                      },
                    },
                  },
                },
              },
              id: 2,
            }),
          }
        );
      })
      .then((res) => res?.json?.())
      .then((readData) => {
        if (!readData?.result) return;
        const now = new Date();

        readData.result.forEach((record) => {
          const messages = record.message_ids;
          if (!Array.isArray(messages) || messages.length === 0) return;

          const sortedMessages = messages
            .filter((m) => m.date && (m.message_type === "email" || m.message_type === "comment"))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          if (sortedMessages.length === 0) return;

          const lastMsg = sortedMessages[sortedMessages.length - 1];
          const lastAuthor = lastMsg.author_id?.display_name || "";
          let lastType = lastMsg.message_type === "comment" ? "interno" : "esterno";
          const is_won = record.won_status === "won";
          console.log(is_won)

          const lastDate = new Date(lastMsg.date);
          const diffInDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

          const typeOfOpp = record.type === "opportunity" ? "Opportunity" : "Lead";
          console.log(sortedMessages)
          console.log(lastMsg, lastType)

          const clientInactivity = diffInDays <= 1
            ? "Customer inactivity (more than a day)"
            : `Customer inactivity (more than ${diffInDays} days)`;

          const unreadEmail = diffInDays <= 1
            ? "Email unread (more than a day)"
            : `Email unread (more than ${diffInDays} days)`;

          const companyInactivity = diffInDays <= 1
            ? "Company inactivity (more than 1 day)"
            : `Company inactivity (more than ${diffInDays} days)`;

          
          // 1) New Email
          if (
            lastType === "esterno" && !is_won &&
            !sortedMessages.some((m) => m.message_type === "comment" && new Date(m.date) > lastDate)
          ) {
            createNotification(record, unreadEmail, typeOfOpp);
            //pushDesktopNotifications(record, unreadEmail, typeOfOpp)
            return;
          }

          // 2) Customer inactivity > 7 days (last internal message, and last external message is > 7 days ago)

          const lastExternalMsg = [...sortedMessages]
            .reverse()
            .find((m) => m.message_type === "email");

          if (
            lastType === "interno" &&
            lastExternalMsg && !is_won &&
            (now - new Date(lastExternalMsg.date)) / (1000 * 60 * 60 * 24) > 7
          ) {
            createNotification(record, diffInDays >= 7 ? clientInactivity : null, typeOfOpp);
            //pushDesktopNotifications(record, clientInactivity, typeOfOpp);
            return;
          }

          // 3) Company inactivity > 7 days (last external message, and last internal message is > 7 days ago)
          const lastInternalMsg = [...sortedMessages]
            .reverse()
            .find((m) => m.message_type === "comment");

          if (
            lastType === "esterno" &&
            lastInternalMsg && !is_won &&
            (now - new Date(lastInternalMsg.date)) / (1000 * 60 * 60 * 24) > 7
          ) {
            createNotification(record, diffInDays >= 7 ? companyInactivity : null, typeOfOpp);
            //pushDesktopNotifications(record, companyInactivity , typeOfOpp);
            return;
          }
        });
      })
      .catch((error) => console.error("Request error:", error));
  }
  
  checkUnactiveLeads();
})();

// JS OF THE CHECKS AND CREATION OF THE BUTTONS
(function () {
  // Checks if you are in the correct page, if you are, it adds the rigth buttons
  function checkUrlAndFill() {
    const isLeadPage = /^https:\/\/221e\.odoo\.com\/odoo\/(action-215|crm)\/\d+/.test(window.location.href); // this is when yoy are in one lead or opportunity
    const isHomeLeadPage = /^https:\/\/221e\.odoo\.com\/odoo\/(action-215|crm)(?!\/)/.test(window.location.href); // this is the homepage of the leads or the opportunities

    if (isHomeLeadPage) {
      addExport(exportData) // adds the button to export data (opportunities and leads to a .csv file) 
    }

    hiddenLeads() // adds the button (the eye) to hide/show the notifications
    
    if (isLeadPage) {
      const shadowRoots = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) shadowRoots.push(el.shadowRoot);
      });

      convertToOpportunity()
      
      if (document.querySelector(".o_button_export_data")) {
        document.querySelector(".o_button_export_data").remove() // we don't want the export button when we are inside a lead/opportunity so we remove it
      }

     function returnShadow() { // i couldn't simply extract the text using html because of this "shadow-root", so we convert this js dynamic element to static html so we can modify the style of it (the problem was that the text had overflow-x: auto so you had to scroll horizontally to read the email)
        for (const sr of shadowRoots) { 
          const text = sr.textContent;
          const fromMatch = text.match(/From:\s*([^\n<]+)<([^>]+)>/i);

          if (fromMatch === null) {
            return true;
          }
        }
        return false;
      }

      // pretty basic: we simply adds the buttons if the container that we want to add them in exist
      if (document.querySelector('.o_statusbar_buttons')) {
        addButton2();
        addButton3();
      }

      if (shadowRoots.length === 0 || returnShadow()) {
        return
      } else {
        FillInformation()
      }
      
      if (document.querySelector('.o_statusbar_buttons')) {
        addButton1();
        addButton4();
        removeShadow();
      }
    }
  }

  // Automatically selects inputs when you click "Convert to Opportunity"
  function convertToOpportunity() {
    const convertToOpportunity = document.querySelector('.btn.btn-primary'); // the "Convert to Opportunity" button
    if (convertToOpportunity) {
      convertToOpportunity.addEventListener('click', () => { // if we click the button
        setTimeout(() => {
          const radios = document.querySelectorAll('input[type="radio"][data-value="convert"]'); // we select the right input
          if (radios.length > 0) {
            radios[0].click();
          }

          setTimeout(() => {
              const radios2 = document.querySelectorAll('input[type="radio"][data-value="create"]'); // we select the other right input
              if (radios2.length > 0) {
                radios2[0].click();
              }
          }, 500)
        }, 500)
      });
    }
  }

  // Fill in the Lead information (the first time bc it checks if the origin is empty) you enter the lead for the first time
  function FillInformation() {
    // this are the containers and the inputs of the custom properties in the lead (Origin, Employees, Industry, Sales)
    // we will need this later (line 491)
    const wrapper = document.querySelector('div[property-name="796cdb112503b3fc"]'); // Origin
    const wrapper2 = document.querySelector('div[property-name="9c362533498ce698"]'); // Employees
    const wrapper3 = document.querySelector('div[property-name="9311a421447f45a9"]'); // Employees
    const wrapper4 = document.querySelector('div[property-name="6b5008f18d7d2629"]'); // Sales
    const input = wrapper?.querySelector('input.o_input'); // Origin
    const input2 = wrapper2?.querySelector('input.o_input'); // Employees
    const input3 = wrapper3?.querySelector('input.o_input'); // Employees
    const input4 = wrapper4?.querySelector('input.o_input'); // Sales
    if (!wrapper || !input || input.value !== "") return;

    const shadowRoots = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) shadowRoots.push(el.shadowRoot);
    });

    shadowRoots.forEach((sr) => { // here we extract from the text all of the useful information
      const text = sr.textContent;

      // here I provide an example of the text

      // From: Pablo Escobar
      // 
      // 
      // Page's url: https://www.221e.com/fitness-and-sport-science
      // Company: Tennis Player
      // Phone: +391234567891
      // 
      // 
      // Message: Hello

      // all the regex to extract the information
      const fromMatch = text.match(/From:\s*([^\n<]+)<([^>]+)>/i);
      const name = fromMatch ? fromMatch[1].trim() : "";
      const email = fromMatch ? fromMatch[2].trim() : "";
      const urlMatch = text.match(/Page's url:\s*([^\n]+)/i);
      const pageUrl = urlMatch ? urlMatch[1].trim() : "";
      const companyMatch = text.match(/Company:\s*([^\n]+)/i);
      const company = companyMatch ? companyMatch[1].trim() : "";
      const phoneMatch = text.match(/Phone:\s*([^\n]*?)(?=\n|Message:|$)/i);
      let messageMatch = text.match(/Message:\s*([\s\S]*?)(\n\s*\n|$)/i);
      const message = messageMatch ? messageMatch[1].trim() : ""; // we don't use the message but I needed it to debug

      const emailInput = document.getElementById("email_from_1");
      if (emailInput) { // to prevent error we first check if the element exist, if it does we can assume that also the other one exist (like contact_name_0 or partner_name_0)
        emailInput.value = email;
      } else {
        return;
      }

      document.getElementById("email_from_1").value = email;
      document.getElementById("contact_name_0").value = name.toUpperCase();
      document.getElementById("partner_name_0").value = company;
      if (phoneMatch) {
        document.getElementById("phone_1").value = phoneMatch[1].trim();
      }

      document.getElementById('name_0').value = `Form contatti: ${name.toUpperCase()}`;
      input.value = pageUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const inputPartner = document.getElementById("partner_id_0");

      if (inputPartner) {
          setTimeout(() => {
            inputPartner.focus(); // if the partner exist we click
            inputPartner.value = name.toUpperCase(); 

            inputPartner.dispatchEvent(new Event('input', { bubbles: true }));
          }, 1000) // we wait 1s to be sure that the window opened

          setTimeout(() => {
              const suggestions = document.querySelectorAll(".dropdown-item.ui-menu-item-wrapper.text-truncate");

              if (suggestions.length > 0) {
                  suggestions.forEach((el) => {
                      const suggestionText = el.innerText;

                      if (suggestionText.includes(`Create "${name.toUpperCase()}"`)) { // we click the "Create NAME SURNAME"
                          el.click();
                      }
                  });
              }
              document.querySelector('.o_form_button_save').click();

              setTimeout(() => {
                scrapeAll().then(data => { // I created an API connected to a chatbot that search on the internet some information about the company and then we fill the information (Origin, Employees, industry, Sales, Location, Website)
                  if (data) {
                    if (data.locationCountry) {
                      document.getElementById("country_id_0").value = data.locationCountry;
                    }
                    if (data.locationCity) {
                      document.getElementById("city_0").value = data.locationCity;
                    } 
                    document.getElementById("website_0").value = data.website;

                    input2.value = data.companySize;
                    input2.dispatchEvent(new Event('input', { bubbles: true }));
                    input2.dispatchEvent(new Event('change', { bubbles: true }));
                    document.querySelector('.o_form_button_save').click();
                  }
                });
                scrapeAll().then(data => {
                  if (data) {
                    input3.value = data.industry;
                    input3.dispatchEvent(new Event('input', { bubbles: true }));
                    input3.dispatchEvent(new Event('change', { bubbles: true }));
                    document.querySelector('.o_form_button_save').click();
                  }
                });
                scrapeAll().then(data => {
                  if (data) {
                    input4.value = data.revenue;
                    input4.dispatchEvent(new Event('input', { bubbles: true }));
                    input4.dispatchEvent(new Event('change', { bubbles: true }));
                    document.querySelector('.o_form_button_save').click();
                    console.log(data)
                  }
                });
              }, 1000)
          }, 2000);
        }
    });
  }

  // Fill in the Lead information every time you click on the button (the only difference between FillInformation and FillInformationManually 
  // is that the first one checks if the origin is empty, if it is it doesn't execute it while FillInformationManually does not care about the 
  // origin and it is executed when you press a button not when you first enter the page)
  function FillInformationManually() {
    const wrapper = document.querySelector('div[property-name="796cdb112503b3fc"]');
    const wrapper2 = document.querySelector('div[property-name="9c362533498ce698"]');
    const wrapper3 = document.querySelector('div[property-name="9311a421447f45a9"]');
    const wrapper4 = document.querySelector('div[property-name="6b5008f18d7d2629"]');
    const input = wrapper?.querySelector('input.o_input');
    const input2 = wrapper2?.querySelector('input.o_input');
    const input3 = wrapper3?.querySelector('input.o_input');
    const input4 = wrapper4?.querySelector('input.o_input');
    if (!wrapper || !input) return;

    const shadowRoots = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) shadowRoots.push(el.shadowRoot);
    });

    shadowRoots.forEach((sr) => {
      const text = sr.textContent;
      const fromMatch = text.match(/From:\s*([^\n<]+)<([^>]+)>/i);
      const name = fromMatch ? fromMatch[1].trim() : "";
      const email = fromMatch ? fromMatch[2].trim() : "";
      const urlMatch = text.match(/Page's url:\s*([^\n]+)/i);
      const pageUrl = urlMatch ? urlMatch[1].trim() : "";
      const companyMatch = text.match(/Company:\s*([^\n]+)/i);
      const company = companyMatch ? companyMatch[1].trim() : "";
      let messageMatch = text.match(/Message:\s*([\s\S]*?)(\n\s*\n|$)/i);
      if (!messageMatch) messageMatch = text.match(/Body of the message:\s*([\s\S]*?)(\n\s*\n|$)/i);
      const message = messageMatch ? messageMatch[1].trim() : "";

      const emailInput = document.getElementById("email_from_1");
      if (emailInput) {
        emailInput.value = email;
      } else {
        return;
      }

      document.getElementById("email_from_1").value = email;
      document.getElementById("contact_name_0").value = name.toUpperCase();
      document.getElementById("partner_name_0").value = company;

      document.getElementById('name_0').value = `Form contatti: ${name.toUpperCase()}`;
      input.value = pageUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    scrapeAll().then(data => {
      if (data) {
        if (data.locationCountry) {
          const inputLocationCountry = document.getElementById("country_id_0")
          inputLocationCountry.value = data.locationCountry
          inputLocationCountry.dispatchEvent(new Event('input', { bubbles: true }));

          const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13
          });
          inputLocationCountry.dispatchEvent(enterEvent);
        }
        if (data.locationCity) {
          document.getElementById("city_0").value = data.locationCity;
        }
        document.getElementById("website_0").value = data.website;

        input2.value = data.companySize;
        input2.dispatchEvent(new Event('input', { bubbles: true }));
        input2.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('.o_form_button_save').click();
      }
    });
    scrapeAll().then(data => {
      if (data) {
        input3.value = data.industry;
        input3.dispatchEvent(new Event('input', { bubbles: true }));
        input3.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('.o_form_button_save').click();
      }
    });
    scrapeAll().then(data => {
      if (data) {
        input4.value = data.revenue;
        input4.dispatchEvent(new Event('input', { bubbles: true }));
        input4.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('.o_form_button_save').click();
        console.log(data)
      }
    });
  }

  // When you click on the "Format" it removes the overflow-x that is annoying
  function removeShadow() {
    const hostsWithShadow = [];
    document.querySelectorAll('*').forEach(el => { // it search all the shadow-root
      if (el.shadowRoot) hostsWithShadow.push(el);
    });

    hostsWithShadow.forEach(host => {
      const shadowRoot = host.shadowRoot;

      const tempDiv = document.createElement('div'); // for each one we create a div so thanks to this we converted a js dynamic element to a static html
      shadowRoot.childNodes.forEach(node => {
        tempDiv.appendChild(node.cloneNode(true));
      });

      tempDiv.querySelectorAll('pre').forEach(pre => {
        let text = pre.textContent;
        let formatted = '';

        const messageIndex = text.indexOf("Message:"); // The next lines are only for the style of the email (italic the first part, normal the message to underline it and of course we remove the overflow-x that was annoying)
        if (messageIndex !== -1) {
          const before = text.slice(0, messageIndex);
          const after = text.slice(messageIndex + "Message:".length);

          formatted = `<i style="font-size: 14px">${before}</i>\n\nMessage:${after}`;
          pre.innerHTML = formatted;
        }

        pre.classList.add('font-size-16');
      });

      if (tempDiv.childNodes.length > 0) {
        host.replaceWith(...tempDiv.childNodes);
      }
    });

    const style = document.createElement('style');
    style.textContent = ` 
      .font-size-16 {
        font-size: 16px !important;
        background: transparent !important;
        font-family: "Arial", sans-serif;
        border: none !important;
        padding: 0 !important;
        white-space: pre-wrap !important;
        word-break: break-word !important;
        margin: 0 !important;
        font-family: var(--body-font-family);
        font-size: var(--body-font-size) !important;
        font-weight: var(--body-font-weight) !important;
        line-height: var(--body-line-height) !important;
      }
      .font-size-16 i {
        font-style: italic;
      }
      .font-size-16 b {
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  // export all of the data of Leads and Opportunity in a excel file
  function exportData() {
    fetch("https://221e.odoo.com/web/dataset/call_kw/crm.lead/search", { // we call a POST request to search all the leads
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "crm.lead",
          method: "search",
          args: [[["active", "=", true]]],
          kwargs: {
            context: {
              lang: "it_IT",
              tz: "Europe/Rome",
              uid: 2,
              allowed_company_ids: [1],
            },
          },
        },
        id: 1,
      }),
    })
      .then((res) => res.json())
      .then((searchData) => {
        const ids = searchData.result;
        if (!Array.isArray(ids) || ids.length === 0) return Promise.reject("No records found");
        return fetch("https://221e.odoo.com/web/dataset/call_kw/crm.lead/web_read", { // we call a POST request to retrieve the information for each lead we found
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: {
              model: "crm.lead",
              method: "web_read",
              args: [ids],
              kwargs: {
                context: {
                  lang: "it_IT",
                  tz: "Europe/Rome",
                  uid: 2,
                  allowed_company_ids: [1],
                  default_type: "lead",
                },
                specification: {
                  id: {},
                  name: {},
                  type: {},
                  contact_name: {},
                  email_from: {},
                  phone: {},
                  website: {},
                  city: {},
                  country_id: { fields: { display_name: {} } },
                  partner_id: { fields: { display_name: {} } },
                  partner_name: {},
                  expected_revenue: {},
                  lead_properties: {},
                  message_ids: {
                    fields: {
                      author_id: { fields: { display_name: {} } },
                      email_from: {},
                      date: {},
                      message_type: {},
                      body: {},
                    },
                  },
                  won_status: {},
                },
              },
            },
            id: 2,
          }),
        });
      })
      .then((res) => (res ? res.json() : null))
      .then((readData) => {
        if (!readData?.result) return;
        const filteredRecords = readData.result.filter((record) => record.won_status !== "");
        const dataForExcel = filteredRecords.map((record) => {
          const props = {};
          if (Array.isArray(record.lead_properties)) {
            record.lead_properties.forEach((prop) => {
              props[prop.string] = prop.value;
            });
          }
          let firstEmailDate = null;
          if (Array.isArray(record.message_ids) && record.message_ids.length > 0) {
            const emails = record.message_ids.filter(
              (m) => m.message_type === "email" && m.date
            );
            if (emails.length > 0) {
              emails.sort((a, b) => new Date(a.date) - new Date(b.date));
              firstEmailDate = emails[0].date;
            }
          }
          return {
            Contact: record.contact_name || "N/A",
            Email: record.email_from || "N/A",
            Date: firstEmailDate || "N/A",
            Origin: props["Origin"] || "N/A",
            Employees: props["Employees"] || "N/A",
            Industry: props["Industry"] || "N/A",
            Sales: props["Sales"] || "N/A",
            Website: record.website || "N/A",
            City: record.city || "N/A",
            Country: record.country_id ? record.country_id.display_name || "N/A" : "N/A",
            "Company name": record.partner_name || "N/A",
            Phone: record.phone || "N/A",
            Revenue: record.expected_revenue || "N/A",
          };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel); // we export all the data to a .csv file
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        XLSX.writeFile(workbook, "leads_export.xlsx");
      })
      .catch((error) => console.error("Request error:", error));
  }

  // It does a request to my other server hosted in vercel to recive some additional informations of the company
  async function scrapeAll() {
    const input = document.querySelector("#partner_name_0");
    const azienda = input ? encodeURIComponent(input.value.trim()) : "";

    if (!azienda || !input) {
      return null;
    }

    const url = `https://scraper-ai-bot-221e.vercel.app/api/index.js?token=rqsJzpYj2b8BIxElXmKFgHWUVkreTM4HoPvyoGCA6I1pYaaPq4pkq9hQL644c5FZC5LoaH2hiLZLbEIfsL0tfgpgotRzhGJG7g0xJKVkTXJLTS2PiJakEyqd90fKjr6A&azienda=${azienda}`; // API call to my external chatbot (the token only adds a security so nobody can use my bot exept who has the token)

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.text();

      const cleaned = data // ok so the chatbot sends the informations with a json format but we can't just trasform it to normal text so we just replace each segments
      .replace(/0:/g, "")
      .replace(/"/g, "")
      .replace(/\\n/g, "")
      .replace(/\n/g, "")
      .replace(/[fd]:\{.*?\}/gs, "")
      .replace(/\{finishReason:[^}]*\}\}?/g, "")
      .replace(/e:,.*/s, "")
      .replace(/json/g, "")
      .replace(/```/g, "")
      .replace(/[{}]/gs, "")
      .replace(/\\/g, "")
      .trim();

    console.log("Cleaned response:", cleaned);
        
    const fields = cleaned.split(",").map(f => f.trim()).filter(Boolean);

    let companyName = "";
    let location = { stato: "", paese: "" };
    let revenue = "";
    let companySize = "";
    let industry = "";
    let website = "";

    fields.forEach(field => {
      const fieldLower = field.toLowerCase();

      if (fieldLower.startsWith("company name:")) {
        companyName = field.slice(field.indexOf(":") + 1).trim();
      } else if (fieldLower.startsWith("location:")) {
        const loc = field.slice(field.indexOf(":") + 1).trim();
        const [stato, paese] = loc.split("_");
        location = { stato: stato || "", paese: paese || "" };
      } else if (fieldLower.startsWith("company size")) {
        companySize = field.slice(field.indexOf(":") + 1).trim();
      } else if (fieldLower.startsWith("revenue:")) {
        revenue = field.slice(field.indexOf(":") + 1).trim();
      } else if (fieldLower.startsWith("industry/vertical:")) {
        industry = field.slice(field.indexOf(":") + 1).trim();
      } else if (fieldLower.startsWith("website:")) {
        website = field.slice(field.indexOf(":") + 1).trim();
      }
    });

    console.log("Company Name:", companyName);
    console.log("Stato:", location.stato);
    console.log("Paese:", location.paese);
    console.log("Company Size:", companySize);
    console.log("Revenue:", revenue);
    console.log("Industry:", industry);
    console.log("Website:", website);

    function cleanField(value) {
      return (value === null || value === undefined || value === "null") ? "" : value.trim();
    }

    return {
      companyName: cleanField(companyName),
      locationCountry: cleanField(location.stato),
      locationCity: cleanField(location.paese),
      companySize: cleanField(companySize),
      revenue: cleanField(revenue),
      industry: cleanField(industry),
      website: cleanField(website)
    };


    } catch (err) {
      console.error("error:", err);
      return null
    }
  };

  // It opens the same window of when you click "Reply" but adds a pre-written text in Italian
  function sendReminderIT() {
    const replyBtn = document.querySelectorAll(".fa-reply"); // this is the "reply to" button
    if (replyBtn.length > 0) {
      replyBtn[0].click(); // we click reply to the last message 
    }

    function capitalizeName(name) {
      return name
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    setTimeout(() => {
      const clientInput = document.getElementById("contact_name_0");
      let clientName = clientInput ? clientInput.value : "";
      clientName = capitalizeName(clientName);
      const modal = document.querySelector(".modal-content");
      if (modal) {
        const paragraph = modal.querySelector(".o-paragraph");
        if (paragraph) {
          paragraph.innerHTML = `Ciao ${clientName},<br>Hai avuto modo di vedere la mia mail precedente?<br>A presto,<br>221e Team<br>`; // Italian reminder
          paragraph.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      const subject = document.querySelector('#subject_0');
      if (subject) {
        let text = subject.value || subject.textContent || '';
        if (text.startsWith('Re: ')) { // we remove "Re: " because when someone respond to an email, the subject becomes "Re: old subject"
          text = text.slice(4);
          if ('value' in subject) {
            subject.value = text;
          } else {
            subject.textContent = text;
          }
        }
      }

      const badges = document.querySelectorAll('.o_field_tags .o_tag');

      const excludedEmails = [ // we want always Irene, Lemrua and info@221e.com to have a copy of the messages
        'info@221e.com',
        'irene.tassinato@221e.com',
        'lemrua.samuel@221e.com'
      ];

      badges.forEach(badge => {
        const email = badge.querySelector('.o_badge_text').title;
        if (email.endsWith('@221e.com') && !excludedEmails.includes(email)) { // we remove all the other recipients and leave only the one we wanted
          const deleteLink = badge.querySelector('a.o_delete');
          if (deleteLink) {
            deleteLink.click();
          }
        }
      });
    }, 1000);
  }

  // It opens the same window of when you click "Reply" but adds a pre-written text in English (same exact function of the previous but in Enlish)
  function sendReminderEN() {
    const replyBtn = document.querySelectorAll(".fa-reply");
    if (replyBtn.length > 0) {
      replyBtn[0].click();
    }

    function capitalizeName(name) {
      return name
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    setTimeout(() => {
      const clientInput = document.getElementById("contact_name_0");
      let clientName = clientInput ? clientInput.value : "";
      clientName = capitalizeName(clientName);
      const modal = document.querySelector(".modal-content");
      if (modal) {
        const paragraph = modal.querySelector(".o-paragraph");
        if (paragraph) {
          paragraph.innerHTML = `Hi ${clientName},<br>Just checking in to see if you had a chance to look at my previous email?<br>Best regards,<br>221e Team<br>`;
          paragraph.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
      const subject = document.querySelector('#subject_0');
      if (subject) {
        let text = subject.value || subject.textContent || '';
        if (text.startsWith('Re: ')) {
          text = text.slice(4);
          if ('value' in subject) {
            subject.value = text;
          } else {
            subject.textContent = text;
          }
        }
      }

      const badges = document.querySelectorAll('.o_field_tags .o_tag');

      const excludedEmails = [
        'info@221e.com',
        'irene.tassinato@221e.com',
        'lemrua.samuel@221e.com',
      ];

      badges.forEach(badge => {
        const email = badge.querySelector('.o_badge_text').title;
        if (email.endsWith('@221e.com') && !excludedEmails.includes(email)) {
          const deleteLink = badge.querySelector('a.o_delete');
          if (deleteLink) {
            deleteLink.click();
          }
        }
      });
    }, 1000);
  }

  // It adds the Button "Reply" and remove the other "Reply to" button of odoo that doesn't work well (pretty similar to the Reminder, the only difference we don't put a default text)
  function replyTo() {
    const replyBtn = document.querySelectorAll(".fa-reply");
    if (replyBtn.length > 0) {
      replyBtn[0].click();
    }

    setTimeout(() => {
      const subject = document.querySelector('#subject_0');
      if (subject) {
        let text = subject.value || subject.textContent || '';
        if (text.startsWith('Re: ')) {
          text = text.slice(4);
          if ('value' in subject) {
            subject.value = text;
          } else {
            subject.textContent = text;
          }
        }
      }

      const badges = document.querySelectorAll('.o_field_tags .o_tag');

      const excludedEmails = [
        'info@221e.com',
        'irene.tassinato@221e.com',
        'lemrua.samuel@221e.com'
      ];

      badges.forEach(badge => {
        const email = badge.querySelector('.o_badge_text').title;
        if (email.endsWith('@221e.com') && !excludedEmails.includes(email)) {
          const deleteLink = badge.querySelector('a.o_delete');
          if (deleteLink) {
            deleteLink.click();
          }
        }
      });

      const text = document.querySelector(".modal-content .o-paragraph");

      if (text) {
          text.focus();

          const deleteEvent = new KeyboardEvent("keydown", {
              key: "Delete",
              code: "Delete",
              keyCode: 46,
              which: 46,
              bubbles: true
          });
          text.dispatchEvent(deleteEvent);
      }
    },1000 )
  }

  // It is the base of the button
  function addButton(text, declareFunction) {
    const container = document.querySelector('.o_statusbar_buttons');
    if (!container) return;

    const exists = Array.from(container.querySelectorAll('button span'))
      .some(span => span.textContent.trim() === text);

    if (exists) return;

    const button = createButton(text, declareFunction);
    container.appendChild(button);
  }

  // It creates the button
  function createButton(text, declareFunction) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.type = 'button';

    const span = document.createElement('span');
    span.textContent = text;

    button.appendChild(span);
    button.addEventListener('click', declareFunction);

    return button;
  }

  // It creates the export Button
  function addExport(declareFunction) {
    const container = document.querySelector('div.o_control_panel_breadcrumbs.d-flex.align-items-center.gap-1.order-0.h-lg-100');
    if (!container) return;

    const exists = Array.from(container.querySelectorAll('button'))
      .some(btn => btn.textContent.trim() === "Export Data");

    if (exists) return;

    if (document.querySelector(".o_button_export_data")) return

    const button = document.createElement('button');
    button.className = 'o_button_export_data btn btn-secondary';
    button.setAttribute('data-hotkey', 'r');
    button.textContent = 'Export Data';
    button.addEventListener('click', declareFunction);

    container.insertBefore(button, container.lastChild);
  }

  // It creates the reply Button
  function addReply(declareFunction) {
    const container = document.querySelector('div.o-mail-Chatter-topbar');
    if (!container) return;

    const replyBtn = document.querySelectorAll(".fa-reply");

    const exists = Array.from(container.querySelectorAll('button'))
      .some(btn => btn.textContent.trim() === "Reply");

    if (exists) return;

    const sendMessageBtn = document.querySelector('.o-mail-Chatter-sendMessage.btn.text-nowrap.me-1.btn-primary.my-2');
    if (sendMessageBtn && replyBtn.length !== 0) {
      sendMessageBtn.remove();
      console.log(replyBtn.length)
    } else {
      return
    }

    const button = document.createElement('button');
    button.className = 'o-mail-Chatter-sendMessage btn text-nowrap me-1 btn-primary my-2';
    button.setAttribute('data-hotkey', 'r');
    button.textContent = 'Reply';
    button.addEventListener('click', declareFunction);

    container.insertBefore(button, container.firstChild);
  }

  // It adds thw Button of an eye that gives visibiliy/invisibility to the leads' notifications
  function hiddenLeads() {
    if (document.querySelector(".leads-button-hidden")) return;

    function toggleLeads() {
      const el = document.querySelector("#lead-inactivity-notifications"); 
      if (el) {
        const isHidden = el.style.display === "none";
        const newState = isHidden ? "flex" : "hidden";
        el.style.display = isHidden ? "flex" : "none";
        sessionStorage.setItem("leadNotificationsVisibility", newState);
      }
    }

    // I should have gone with 2 images [TO CHANGE]
    const img1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAXNSR0IArs4c6QAAIABJREFUeF7tnQn8vtWY/z9/kkQhaSNLQxj72jaIUoPGUvYtyhJtShMx9iWyhLFPSMYeYoxIKmuUbZCQKbKVNVsKmf/9rvOt57s+271c55zP9Xo9fj+/7uU67+s8z33d51zL/5PFBEzABEzABEygOgL/r7oRe8AmYAImYAImYAKyA+BJYAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzABEzABE7AD4DlgAiZgAiZgAhUSsANQodE9ZBMwARMwAROwA+A5YAImYAImYAIVErADUKHRPWQTMAETMAETsAPgOWACJmACJmACFRKwA1Ch0T1kEzAB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L20CJmACJmACUQnYAYhqGetlAiZgAiZgAh0SsAPQIVxf2gRMwARMwASiErADENUy1ssETMAETMAEOiRgB6BDuL60CZiACZiACUQlYAcgqmWslwmYgAmYgAl0SMAOQIdwfWkTMAETMAETiErADkBUy1gvEzABEzABE+iQgB2ADuH60iZgAiZgAiYQlYAdgKiWsV4mYAImYAIm0CEBOwAdwvWlTcAETMAETCAqATsAUS1jvUzABEzABEygQwJ2ADqE60ubgAmYgAmYQFQCdgCiWsZ6mYAJmIAJmECHBOwAdAjXlzYBEzABEzCBqATsAES1jPUyARMwARMwgQ4J2AHoEK4vbQImYAImYAJRCdgBiGoZ62UCJmACJmACHRKwA9AhXF/aBEzABEzABKISsAMQ1TLWywRMwARMwAQ6JGAHoEO4vrQJmIAJmIAJRCVgByCqZayXCZiACZiACXRIwA5Ah3B9aRMwARMwAROISsAOQFTLWC8TMAETMAET6JCAHYAO4frSJmACJmACJhCVgB2AqJaxXiZgAiZgAibQIQE7AB3C9aVNwARMwARMICoBOwBRLWO9TMAETMAETKBDAnYAOoTrS5uACZiACZhAVAJ2AKJaxnqZgAmYgAmYQIcE7AB0CNeXNgETMAETMIGoBOwARLWM9TIBEzABEzCBDgnYAegQri9tAiZgAiZgAlEJ2AGIahnrZQImYAImYAIdErAD0CFcX9oETMAETMAEohKwAxDVMtbLBEzABEzABDokYAegQ7i+tAmYgAmYgAlEJWAHIKplrJcJmIAJmIAJdEjADkCHcH1pEzABEzABE4hKwA5AVMtYLxMwARMwARPokIAdgA7h+tImYAImYAImEJWAHYColrFeJmACJmACJtAhATsAHcL1pU3ABEzABEwgKgE7AFEtY71MwARMwARMoEMCdgA6hOtLm4AJmIAJmEBUAnYAolrGepmACZiACZhAhwTsAHQI15c2ARMwARMwgagE7ABEtYz1MgETMAETMIEOCdgB6BCuL20CJmACJmACUQnYAYhqGetlAiZgAiZgAh0SsAPQIVxf2gRMwARMwASiErADENUy1ssETMAETMAEOiRgB6BDuL60CZiACZiACUQlYAcgqmWslwmYgAmYgAl0SMAOQIdwfWkTMAETMAETiErg/wPRP5LYqHHW7wAAAABJRU5ErkJggg==";
    const img2 = "data:image/png;base64,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";

    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // this are some style attribute
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgElement.setAttribute("width", "512");
    svgElement.setAttribute("height", "512");
    svgElement.setAttribute("viewBox", "0 0 512 512");
    svgElement.setAttribute("style", "width: 20px; height: 20px; margin-right: 7px; cursor: pointer");
    svgElement.setAttribute("class", "leads-button-hidden"); 

    const imageElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    imageElement.setAttribute("x", "0");
    imageElement.setAttribute("y", "0");
    imageElement.setAttribute("width", "512");
    imageElement.setAttribute("height", "512");
    svgElement.appendChild(imageElement);

    let toggled = false;

    function applyVisibilityStateFromStorage() {
      const savedState = sessionStorage.getItem("leadNotificationsVisibility");
      const el = document.querySelector("#lead-inactivity-notifications");

      if (el) { // when you click the eye it hide/show the notifications
        if (savedState === "hidden") {
          el.style.display = "none";
          imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", img2);
          toggled = true;
        } else {
          el.style.display = "flex";
          imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", img1);
          toggled = false;
        }
      }
    }

    svgElement.addEventListener("click", () => {
      toggled = !toggled;
      imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", toggled ? img2 : img1);
      toggleLeads();
    });

    const menuContainer = document.querySelector(".o_menu_systray");
    if (menuContainer) {
      const wrapper = document.createElement("div");
      wrapper.appendChild(svgElement);
      menuContainer.insertBefore(wrapper, menuContainer.firstChild);
      applyVisibilityStateFromStorage();
    }
  }

  // Function to create the buttons
  function addButton1() {
    addButton('Fill Manually', FillInformationManually);
  }

  function addButton2() {
    addButton('Reminder IT', sendReminderIT);
    addReply(replyTo)
  }

  function addButton3() {
    addButton('Reminder EN', sendReminderEN);
  }

  function addButton4() {
    addButton('Format', removeShadow);
  }

  setInterval(checkUrlAndFill, 1000);

  // It refresh the emails every 10sec
  setInterval(() => {
    fetch("https://221e.odoo.com/web/dataset/call_button/fetchmail.server/fetch_mail", { // POST request to fetch new incoming email
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 36,
      jsonrpc: "2.0",
      method: "call",
      params: {
        args: [[7]],
        kwargs: {
          context: {
            lang: "it_IT",
            tz: "Europe/Rome",
            uid: 2,
            allowed_company_ids: [1]
          }
        },
        method: "fetch_mail",
        model: "fetchmail.server"
      }
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("error" + response.status);
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  }, 10 * 1000)

  // It makes a request to delete the duplicates Leads if there are any
  setInterval(() => {
    fetch('https://221e.odoo.com/web/dataset/call_button/ir.cron/method_direct_trigger', { // it's disable for now: https://221e.odoo.com/odoo/crons/25
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 52,
        jsonrpc: "2.0",
        method: "call",
        params: {
          args: [[25]],
          kwargs: {
            context: {
              params: {
                actionStack: [
                  { displayName: "Azioni pianificate", action: "crons", view_type: "list" },
                  { displayName: "Delete Leads", action: "crons", view_type: "form", resId: 25 }
                ],
                resId: 25,
                action: "crons"
              },
              lang: "it_IT",
              tz: "Europe/Rome",
              uid: 2,
              allowed_company_ids: [1]
            }
          },
          method: "method_direct_trigger",
          model: "ir.cron"
        }
      })
    })
    .then(res => res.json())
    .then(data => console.log('Success:', data))
    .catch(err => console.error('Error:', err));
  }, 30 * 1000)
})();