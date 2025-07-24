    /*
    setTimeout(() => {
        let string = document.getElementById('name_0');

        if (!string) {
            return
        }

        string = string.value

        if (string.includes("<") && string.includes(">")) {

            let name = string.split(": ")[1].split("<")[0].toUpperCase();
            let email = string.split("<")[1].split(">")[0].toLowerCase();

            document.getElementById("email_from_1").value = email;
            document.getElementById("contact_name_0").value = name;
            document.getElementById('name_0').value = `Form contatti: ${name}`;

            document.querySelector('.o_form_button_save').click();
        }
    }, 3000);


    setTimeout(() => {
        const wrapper = document.querySelector('div[property-name="03af3f04112d74c0"]');
        const input = wrapper.querySelector('input.o_input');

        if (!wrapper || !input || !input.value == "") {
            return;
        }

        const shadowRoots = [];

        document.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
                shadowRoots.push(el.shadowRoot);
            }
        });

        shadowRoots.forEach((sr, i) => {
            const text = sr.textContent;

            const fromMatch = text.match(/From:\s*([^\n<]+)<([^>]+)>/i);
            const name = fromMatch ? fromMatch[1].trim() : "";
            const email = fromMatch ? fromMatch[2].trim() : "";

            const urlMatch = text.match(/Page's url:\s*([^\n]+)/i);
            const pageUrl = urlMatch ? urlMatch[1].trim() : "";

            const companyMatch = text.match(/Company:\s*([^\n]+)/i);
            const company = companyMatch ? companyMatch[1].trim() : "";

            let messageMatch = text.match(/Message:\s*([\s\S]*?)(\n\s*\n|$)/i);
            if (!messageMatch) {
                messageMatch = text.match(/Body of the message:\s*([\s\S]*?)(\n\s*\n|$)/i);
            }
            const message = messageMatch ? messageMatch[1].trim() : "";

            document.getElementById("email_from_1").value = email;
            document.getElementById("contact_name_0").value = name.toUpperCase();
            document.getElementById("partner_name_0").value = company;
            document.getElementById('name_0').value = `Form contatti: ${name.toUpperCase()}`;
            input.value = pageUrl;

            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            
            document.querySelector('.o_form_button_save').click();
        });
    }, 3000);

    */





(function () {
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
    btnPorta.textContent = "Portami al " + typeOfOpp;
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
    btnIgnora.textContent = "Ignora";
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
                    name: {},
                    type: {},
                    message_ids: {
                      fields: {
                        author_id: { fields: { display_name: {} } },
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
          const lastType = lastMsg.message_type === "comment" ? "interno" : "esterno";
          const lastDate = new Date(lastMsg.date);
          const diffInDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
          const textDiffInDays = diffInDays <= 1 ? "" : diffInDays

          const typeOfOpp = record.type === "opportunity" ? "Opportunità" : "Lead";

          if (
            lastType === "esterno" &&
            !sortedMessages.some((m) => m.message_type === "comment" && new Date(m.date) > lastDate)
          ) {
            creaNotifica(record, `Nuova email non letta ${textDiffInDays === "" ? "" : "da"} ${textDiffInDays} ${textDiffInDays === "" ? "" : "giorni"}`, typeOfOpp);
            return;
          }

          // 2) Inattività da parte del cliente > 7 giorni (ultimo messaggio interno, e l'ultimo messaggio esterno è > 7 giorni fa)

          const lastExternalMsg = [...sortedMessages]
            .reverse()
            .find((m) => m.message_type === "email" && m.author_id?.display_name !== "Irene Tassinato" && m.author_id?.display_name !== "Alt Jacopo");

          if (
            lastType === "interno" &&
            lastExternalMsg &&
            (now - new Date(lastExternalMsg.date)) / (1000 * 60 * 60 * 24) > 7
          ) {
            creaNotifica(record,`Inattività da parte del cliente (oltre ${textDiffInDays} giorni)`, typeOfOpp);
            return;
          }

          // 3) Inattività da parte dell'azienda > 7 giorni (ultimo messaggio esterno, e l'ultimo messaggio interno è > 7 giorni fa)
          const lastInternalMsg = [...sortedMessages]
            .reverse()
            .find((m) => m.message_type === "comment");

          if (
            lastType === "esterno" &&
            lastInternalMsg &&
            (now - new Date(lastInternalMsg.date)) / (1000 * 60 * 60 * 24) > 7
          ) {
            creaNotifica(record, "Inattività da parte dell'azienda (oltre 7 giorni)", typeOfOpp);
            return;
          }
        });
      })
      .catch((error) => console.error("Errore nella richiesta:", error));
  }

  checkLeadInattivi();


  /* setTimeout(() => {
    const wrapper = document.querySelector('div[property-name="796cdb112503b3fc"]');
    const input = wrapper?.querySelector('input.o_input');
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
      let messageMatch = text.match(/Message:\s*([\s\S]*?)(\n\s*\n|$)/i);
      if (!messageMatch) messageMatch = text.match(/Body of the message:\s*([\s\S]*?)(\n\s*\n|$)/i);
      const message = messageMatch ? messageMatch[1].trim() : "";

      const emailInput = document.getElementById("email_from_1");
      if (emailInput) {
        emailInput.value = email;
      } else {
        return
      }

      document.getElementById("email_from_1").value = email;
      document.getElementById("contact_name_0").value = name.toUpperCase();
      document.getElementById("partner_name_0").value = company;

      document.getElementById('name_0').value = `Form contatti: ${name.toUpperCase()}`;
      input.value = pageUrl;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('.o_form_button_save').click();
    });
  }, 3000); */
})();



(function () {
  function checkUrlAndFill() {
    const isLeadPage = /^https:\/\/221e\.odoo\.com\/odoo\/action-215\/\d+/.test(window.location.href);
    if (isLeadPage) {
      const shadowRoots = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) shadowRoots.push(el.shadowRoot);
      });

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
        if (data.locationCountry !== undefined) {
          document.getElementById("country_id_0").value = data.locationCountry;
        }
        if (data.locationCity !== undefined) {
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
        if (data.locationCountry !== undefined) {
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
        if (data.locationCity !== undefined) {
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
        .replace(/\\n/g, "\n")
        .replace(/\n/g, "")
        .replace(/[fd]:\{.*?\}/gs, "")
        .replace(/\{finishReason:[^}]*\}\}?/g, "")
        .replace(/e:,.*/s, "")
        .replace(/(Company name:)/g, "\n$1")
        .replace(/(Location:)/g, "\n$1")
        .replace(/(Company size.*?:)/g, "\n$1")
        .replace(/(Revenue:)/g, "\n$1")
        .replace(/(Industry\/Vertical:)/g, "\n$1")
        .replace(/(Website:)/g, "\n$1");

      const lines = cleaned.split("\n").map(line => line.trim()).filter(Boolean);

      let companyName = "";
      let location = "";
      let revenue = "";
      let companySize = "";
      let industry = "";
      let website = "";

      lines.forEach(line => {
        if (line.startsWith("Company name:")) {
          companyName = line.replace("Company name:", "").trim();
        } else if (line.startsWith("Location:")) {
          const locString = line.replace("Location:", "").trim();
          const parts = locString.split(",").map(p => p.trim());
          location = {
            country: parts[0] || "",
            city: parts[1] || ""
          };
        } else if (line.startsWith("Company size:") || line.startsWith("Company size (number of employees):")) {
          companySize = line.replace(/Company size.*?:/, "").trim();
        } else if (line.startsWith("Revenue:")) {
          revenue = line.replace("Revenue:", "").trim();
        } else if (line.startsWith("Industry/Vertical:")) {
          industry = line.replace("Industry/Vertical:", "").trim();
        } else if (line.startsWith("Website:")) {
          website = line.replace("Website:", "").trim();
        }
      });

      return {
        companyName,
        locationCountry: location.country,
        locationCity: location.city,
        companySize,
        revenue,
        industry,
        website
      };
    } catch (err) {
      console.error("error:", err);
      return null;
    }
  }

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
    }, 1000);
  }

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
    }, 1000);
  }

  function addButton(text, funzioneClick) {
    const container = document.querySelector('.o_statusbar_buttons');
    if (!container) return;

    const exists = Array.from(container.querySelectorAll('button span'))
      .some(span => span.textContent.trim() === text);

    if (exists) return;

    const button = createButton(text, funzioneClick);
    container.appendChild(button);
  }

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

  function addButton1() {
    addButton('Riempi Manualmente', FillInformationManually);
  }

  function addButton2() {
    addButton('Promemoria IT', inviaEmailDiInteresseIT);
  }

  function addButton3() {
    addButton('Promemoria EN', inviaEmailDiInteresseEN);
  }

  function addButton4() {
    addButton('Formatta Email', removeShadow);
  }


  setInterval(checkUrlAndFill, 100);


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
})();