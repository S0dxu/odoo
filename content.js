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
          // Definiamo "cliente" come autore esterno (non nostro team)
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


  setTimeout(() => {
    const wrapper = document.querySelector('div[property-name="03af3f04112d74c0"]');
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
  }, 3000);
})();



(function () {
  const isLeadPage = /^https:\/\/221e\.odoo\.com\/odoo\/action-215\/\d+/.test(window.location.href);
  if (!isLeadPage) return;

  function riempiInformazioni() {
    const wrapper = document.querySelector('div[property-name="03af3f04112d74c0"]');
    const input = wrapper?.querySelector('input.o_input');

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
  }

  function inviaEmailDiInteresse() {
    console.log("ancora da integrare...")
  }

  function aggiungiBottone() {
    const container = document.querySelector('.o_statusbar_buttons');
    if (!container) {
      return;
    }

    const exists = Array.from(container.querySelectorAll('button span'))
      .some(span => span.textContent.trim() === "Riempi Manualmente");

    if (exists) return;

    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.type = 'button';

    const span = document.createElement('span');
    span.textContent = 'Riempi Manualmente';

    button.appendChild(span);
    button.addEventListener('click', riempiInformazioni);
    container.appendChild(button);
  }

  function aggiungiBottone2() {
    const container = document.querySelector('.o_statusbar_buttons');
    if (!container) {
      return;
    }

    const exists = Array.from(container.querySelectorAll('button span'))
      .some(span => span.textContent.trim() === "Invia Promemoria di Interesse");

    if (exists) return;

    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.type = 'button';

    const span = document.createElement('span');
    span.textContent = 'Invia Promemoria di Interesse';

    button.appendChild(span);
    button.addEventListener('click', inviaEmailDiInteresse);
    container.appendChild(button);
  }

  const observer = new MutationObserver((mutations, obs) => {
    if (document.querySelector('.o_statusbar_buttons')) {
      aggiungiBottone();
      aggiungiBottone2();
      obs.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

(function() {
  const match = window.location.href.match(/^https:\/\/221e\.odoo\.com\/odoo\/action-215\/\d+$/);
  if (!match) return;

  setTimeout(() => {
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
  }, 5000);
})();


// refresha le email quando sei nei leads e ricarichi la pagina
(function() {
    fetch("https://221e.odoo.com/web/dataset/call_button/fetchmail.server/fetch_mail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: 15,
      jsonrpc: "2.0",
      method: "call",
      params: {
        args: [[2]],
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
    }),
    credentials: "include"
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("error:", error));
})();