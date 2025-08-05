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
      right: "20px",
      width: "320px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column-reverse",
      gap: "10px",
      fontFamily: "'TikTok Sans', Arial, sans-serif",
    });
    document.body.appendChild(container);
    const style = document.createElement("style");
    style.textContent = `@import url('https://fonts.googleapis.com/css2?family=TikTok+Sans:opsz,wght@12..36,300..900&display=swap');`;
    document.head.appendChild(style);
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

  // CSS and the creation of the notifications
  function creaNotifica(lead, messaggio, typeOfOpp = "Lead") {
    if (getIgnoredLeads().includes(lead.id)) return;
    const notif = document.createElement("div");
    notif.style = `
      background: #fff;
      border: 1px solid #dadada;
      padding: 12px;
      border-radius: 8px 8px 0 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
  function checkLeadInattivi() {
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
          const textDiffInDays = diffInDays <= 1 ? "" : diffInDays

          const typeOfOpp = record.type === "opportunity" ? "Opportunity" : "Lead";
          console.log(sortedMessages)
          console.log(lastMsg, lastType)

          if (
            lastType === "esterno" && !is_won &&
            !sortedMessages.some((m) => m.message_type === "comment" && new Date(m.date) > lastDate)
          ) {
            creaNotifica(record, `Email unread${textDiffInDays === "" ? "" : " for"} ${textDiffInDays} ${textDiffInDays === "" ? "" : "days"}`, typeOfOpp);
            return;
          }

          // 2) Inattività da parte del cliente > 7 giorni (ultimo messaggio interno, e l'ultimo messaggio esterno è > 7 giorni fa)

          const lastExternalMsg = [...sortedMessages]
            .reverse()
            .find((m) => m.message_type === "email");

          if (
            lastType === "interno" &&
            lastExternalMsg && !is_won &&
            (now - new Date(lastExternalMsg.date)) / (1000 * 60 * 60 * 24) > 7
          ) {
            creaNotifica(record,`Customer inactivity (more than ${textDiffInDays} days)`, typeOfOpp);
            return;
          }

          // 3) Inattività da parte dell'azienda > 7 giorni (ultimo messaggio esterno, e l'ultimo messaggio interno è > 7 giorni fa)
          const lastInternalMsg = [...sortedMessages]
            .reverse()
            .find((m) => m.message_type === "comment");

          if (
            lastType === "esterno" &&
            lastInternalMsg && !is_won &&
            (now - new Date(lastInternalMsg.date)) / (1000 * 60 * 60 * 24) > 7
          ) {
            creaNotifica(record, "Inactivity by the company (more than 7 days)", typeOfOpp);
            return;
          }
        });
      })
      .catch((error) => console.error("Request error:", error));
  }

  checkLeadInattivi();
})();

// JS OF THE CHECKS AND CREATION OF THE BUTTONS
(function () {
  function checkUrlAndFill() {
    const isLeadPage = /^https:\/\/221e\.odoo\.com\/odoo\/(action-215|crm)\/\d+/.test(window.location.href);
    const isHomeLeadPage = /^https:\/\/221e\.odoo\.com\/odoo\/(action-215|crm)(?!\/)/.test(window.location.href);

    if (isHomeLeadPage) {
      addExport(exportData)
    }
    
    if (isLeadPage) {
      const shadowRoots = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) shadowRoots.push(el.shadowRoot);
      });

      convertToOpportunity()
      
      if (document.querySelector(".o_button_export_data")) {
        document.querySelector(".o_button_export_data").remove()
      }

     function returnShadow() {
        for (const sr of shadowRoots) {
          const text = sr.textContent;
          const fromMatch = text.match(/From:\s*([^\n<]+)<([^>]+)>/i);

          if (fromMatch === null) {
            return true;
          }
        }
        return false;
      }

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
      }
    }
  }

  // Automatically selects inputs when you click "Convert to Opportunity"
  function convertToOpportunity() {
    const convertToOpportunity = document.querySelector('.btn.btn-primary');
    if (convertToOpportunity) {
      convertToOpportunity.addEventListener('click', () => {
        setTimeout(() => {
          const radios = document.querySelectorAll('input[type="radio"][data-value="convert"]');
          if (radios.length > 0) {
            radios[0].click();
          }

          setTimeout(() => {
              const radios2 = document.querySelectorAll('input[type="radio"][data-value="create"]');
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
    const wrapper = document.querySelector('div[property-name="796cdb112503b3fc"]');
    const wrapper2 = document.querySelector('div[property-name="9c362533498ce698"]');
    const wrapper3 = document.querySelector('div[property-name="9311a421447f45a9"]');
    const wrapper4 = document.querySelector('div[property-name="6b5008f18d7d2629"]');
    const input = wrapper?.querySelector('input.o_input');
    const input2 = wrapper2?.querySelector('input.o_input');
    const input3 = wrapper3?.querySelector('input.o_input');
    const input4 = wrapper4?.querySelector('input.o_input');
    if (!wrapper || !input || input.value !== "") return;

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
      const phoneMatch = text.match(/Phone:\s*([^\n]+)/i);
      let messageMatch = text.match(/Message:\s*([\s\S]*?)(\n\s*\n|$)/i);
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
      if (phoneMatch) {
        document.getElementById("phone_1").value = phoneMatch[1].trim();
      }

      document.getElementById('name_0').value = `Form contatti: ${name.toUpperCase()}`;
      input.value = pageUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    scrapeAll().then(data => {
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
  }

  // Fill in the Lead information every time you click on the button (it has some difference between FillInformation)
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
    document.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) hostsWithShadow.push(el);
    });

    hostsWithShadow.forEach(host => {
      const shadowRoot = host.shadowRoot;

      const tempDiv = document.createElement('div');
      shadowRoot.childNodes.forEach(node => {
        tempDiv.appendChild(node.cloneNode(true));
      });

      tempDiv.querySelectorAll('pre').forEach(pre => {
        pre.classList.add('font-size-16');
      });

      if (tempDiv.childNodes.length > 0) {
        host.replaceWith(...tempDiv.childNodes);
      }
    });

    const style = document.createElement('style');
    style.textContent = `
      .font-size-16 {
        font-size: 14px !important;
        background: transparent !important;
        font-family: "Arial", sans-serif;
        border: none !important;
        padding: 0 !important;
        white-space: pre-wrap !important;
        word-break: break-word !important;
        margin: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // export all of the data of Leads and Opportunity in a excel file
  function exportData() {
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
        return fetch("https://221e.odoo.com/web/dataset/call_kw/crm.lead/web_read", {
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
            Città: record.city || "N/A",
            Paese: record.country_id ? record.country_id.display_name || "N/A" : "N/A",
            "Company name": record.partner_name || "N/A",
            Phone: record.phone || "N/A",
            Revenue: record.expected_revenue || "N/A",
          };
        });
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
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

    const url = `https://scraper-ai-bot-221e.vercel.app/api/index.js?token=rqsJzpYj2b8BIxElXmKFgHWUVkreTM4HoPvyoGCA6I1pYaaPq4pkq9hQL644c5FZC5LoaH2hiLZLbEIfsL0tfgpgotRzhGJG7g0xJKVkTXJLTS2PiJakEyqd90fKjr6A&azienda=${azienda}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.text();

      const cleaned = data
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
  function inviaEmailDiInteresseIT() {
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
          paragraph.innerHTML = `Gentile ${clientName},<br>Spero che questo messaggio La trovi bene.<br>La contatto per sapere se è ancora interessato a proseguire con il progetto di cui abbiamo discusso.<br>Resto a disposizione per eventuali domande o approfondimenti.<br>In attesa di un Suo gentile riscontro, Le auguro una buona giornata.<br>Cordiali saluti,<br>221e`;
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

      badges.forEach(badge => {
        const email = badge.querySelector('.o_badge_text').title;
        if (email.endsWith('@221e.com') && !email.endsWith('info@221e.com')) {
          const deleteLink = badge.querySelector('a.o_delete');
          if (deleteLink) {
            deleteLink.click();
          }
        }
      });
    }, 1000);
  }

  // It opens the same window of when you click "Reply" but adds a pre-written text in English
  function inviaEmailDiInteresseEN() {
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
          paragraph.innerHTML = `Dear ${clientName},<br>I hope this message finds you well.<br>I am contacting you to see if you are still interested in continuing with the project we discussed.<br>I remain available for any questions or further information.<br>I look forward to hearing from you. Have a good day.<br>Best regards,<br>221e`;
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

      badges.forEach(badge => {
        const email = badge.querySelector('.o_badge_text').title;
        if (email.endsWith('@221e.com') && !email.endsWith('info@221e.com')) {
          const deleteLink = badge.querySelector('a.o_delete');
          if (deleteLink) {
            deleteLink.click();
          }
        }
      });
    }, 1000);
  }

  // It adds the Button "Reply" and remove the other "Reply to" button of odoo that doesn't work well
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

      badges.forEach(badge => {
        const email = badge.querySelector('.o_badge_text').title;
        if (email.endsWith('@221e.com') && !email.endsWith('info@221e.com')) {
          const deleteLink = badge.querySelector('a.o_delete');
          if (deleteLink) {
            deleteLink.click();
          }
        }
      });
    },1000 )
  }

  // It is the base of the button
  function addButton(text, funzioneClick) {
    const container = document.querySelector('.o_statusbar_buttons');
    if (!container) return;

    const exists = Array.from(container.querySelectorAll('button span'))
      .some(span => span.textContent.trim() === text);

    if (exists) return;

    const button = createButton(text, funzioneClick);
    container.appendChild(button);
  }

  // It creates the button
  function createButton(text, funzioneClick) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.type = 'button';

    const span = document.createElement('span');
    span.textContent = text;

    button.appendChild(span);
    button.addEventListener('click', funzioneClick);

    return button;
  }

  // It creates the export Button
  function addExport(funzioneClick) {
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
    button.addEventListener('click', funzioneClick);

    container.insertBefore(button, container.lastChild);
  }

  // It creates the reply Button
  function addReply(funzioneClick) {
    const container = document.querySelector('div.o-mail-Chatter-topbar');
    if (!container) return;

    const exists = Array.from(container.querySelectorAll('button'))
      .some(btn => btn.textContent.trim() === "Reply");

    if (exists) return;

    const sendMessageBtn = document.querySelector('.o-mail-Chatter-sendMessage.btn.text-nowrap.me-1.btn-primary.my-2');
    if (sendMessageBtn) {
      sendMessageBtn.remove();
    } else {
      return
    }

    const button = document.createElement('button');
    button.className = 'o-mail-Chatter-sendMessage btn text-nowrap me-1 btn-primary my-2';
    button.setAttribute('data-hotkey', 'r');
    button.textContent = 'Reply';
    button.addEventListener('click', funzioneClick);

    container.insertBefore(button, container.firstChild);
  }

  // Function to create the buttons
  function addButton1() {
    addButton('Fill Manually', FillInformationManually);
  }

  function addButton2() {
    addButton('Reminder IT', inviaEmailDiInteresseIT);
    addReply(replyTo)
  }

  function addButton3() {
    addButton('Reminder EN', inviaEmailDiInteresseEN);
  }

  function addButton4() {
    addButton('Format', removeShadow);
  }

  setInterval(checkUrlAndFill, 100);

  // It refresh the emails every 5sec
  setInterval(() => {
    fetch("https://221e.odoo.com/web/dataset/call_button/fetchmail.server/fetch_mail", {
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
  }, 5000)

  // It makes a request to delete the duplicates Leads if there are any
  setInterval(() => {
    fetch('https://221e.odoo.com/web/dataset/call_button/ir.cron/method_direct_trigger', {
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
  }, 30000)
})();