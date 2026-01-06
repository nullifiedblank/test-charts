document.addEventListener('DOMContentLoaded', () => {

  const nav = document.querySelector('#navigation');
  let currentMode;

  // Manage 'nav-bg' on small screens
  const manageNavBg = () => {
    const navBg = document.querySelector('.nav-bg');
    if (window.innerWidth < 900) {
      if (!navBg) {
        const newNavBg = document.createElement('div');
        newNavBg.className = 'nav-bg';
        nav.parentNode.insertBefore(newNavBg, nav);
      }
    } else if (navBg) {
      navBg.remove();
    }
  };

  // Create toast notifications
  const createToast = (type, title, description) => {
    const toaster = document.querySelector('#toaster');
    if (toaster) {
      const toast = document.createElement('div');
      toast.className = 'notice';
      toast.dataset.type = type;
      toast.innerHTML = `<h2>${title}</h2><p>${description}</p>`;
      toaster.insertAdjacentElement('afterbegin', toast);
      setTimeout(() => toast.remove(), 10000);
    }
  };

  // Update the "Select All" checkbox based on siblings
  const updateSelectAllState = (selectAllLabel) => {
    const checkbox = selectAllLabel.querySelector('input[type="checkbox"]');
    const siblings = [...selectAllLabel.closest('ul').querySelectorAll('li > label > input[type="checkbox"]:not([name="toggle_all"])')];
    checkbox.checked = siblings.every(sibling => sibling.checked);
    selectAllLabel.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = checkbox.checked ? ' Deselect all' : ' Select all';
      }
    });
  };

  // Enable the "Apply" button in dropdowns
  const enableApplyButton = (drop) => {
    const applyButton = drop.querySelector('.drop-footer .button[disabled]');
    if (applyButton) applyButton.removeAttribute('disabled');
  }

  // Toggle all checkboxes in the list
  const toggleCheckboxes = (selectAllLabel) => {
    const checkbox = selectAllLabel.querySelector('input[type="checkbox"]');
    const siblings = [...selectAllLabel.closest('ul').querySelectorAll('li > label > input[type="checkbox"]:not([name="toggle_all"])')];
    siblings.forEach(sibling => sibling.checked = checkbox.checked);
    updateSelectAllState(selectAllLabel);
  };

  // Initialize "Select All" functionality
  const initializeSelectAll = (context = document) => {
    if (!(context instanceof Element)) context = document;
    context.querySelectorAll('input[name="toggle_all"]').forEach(selectAllCheckbox => {
      updateSelectAllState(selectAllCheckbox.closest('label'));
    });
  };

  // Switch the first word in details view title based on mode (Add / Edit)
  const updateTitlePrefix = () => {
    if (!currentMode) return;
  
    const titleElement = document.querySelector('#title h1');
    if (!titleElement) return;
  
    const titleText = titleElement.textContent.trim();
    const words = titleText.split(' ');
  
    if (words.length > 1) {
      words[0] = currentMode === 'add' ? 'Add' : 'Edit';
      titleElement.textContent = words.join(' ');
    }
  
    currentMode = undefined; // Reset the variable after updating
  };

  // Update button[data-type="counter"] text based on checked checkboxes in the next sibling dropdown
  const updateCounterButtons = (context = document) => {
    context.querySelectorAll('button[data-type="counter"]').forEach(button => {
      const drop = button.nextElementSibling;
      if (!drop) return;

      const checkboxes = [...drop.querySelectorAll('.drop-main input[type="checkbox"]:not([name="toggle_all"])')];
      const selectAll = drop.querySelector('.drop-main input[name="toggle_all"]');
      const checkedCount = checkboxes.filter(checkbox => checkbox.checked).length;

      if (checkedCount === checkboxes.length) {
        button.textContent = 'All users selected';
        if (selectAll) selectAll.checked = true; // Ensure "Select All" reflects state
      } else if (checkedCount === 0) {
        button.textContent = 'No users selected';
        if (selectAll) selectAll.checked = false;
      } else {
        button.textContent = `${checkedCount} user${checkedCount > 1 ? 's' : ''} selected`;
        if (selectAll) selectAll.checked = false; // Uncheck "Select All" if not all are selected
      }
    });
  };

  // handle dropdown positioning for dropdowns inside tables
  const positionDropdowns = () => {
    document.querySelectorAll('.table-container table .button.is-icon.is-down[data-open="true"]').forEach(button => {
      const drop = button.nextElementSibling;
      if (!drop || !drop.classList.contains('drop')) return;
  
      // Ensure dropdown is initially hidden before positioning
      drop.style.visibility = 'hidden';
      drop.style.opacity = '0';
  
      requestAnimationFrame(() => {
        const rect = button.getBoundingClientRect();
  
        drop.style.position = 'fixed';
        drop.style.top = `${rect.bottom}px`;
        drop.style.right = `${window.innerWidth - rect.right - 10}px`;
        drop.style.left = 'unset';
        drop.style.zIndex = '1000';
  
        // Reveal dropdown once positioned correctly
        drop.style.visibility = 'visible';
        drop.style.opacity = '1';
  
        // Make sure dropdown closes on scroll
        const closeOnScroll = (event) => {
          if (drop.contains(event.target)) return; // Ignore scroll inside dropdown
          button.dataset.open = 'false';
          drop.style.visibility = 'hidden';
          drop.style.opacity = '0';
          window.removeEventListener('wheel', closeOnScroll);
        };
  
        window.addEventListener('wheel', closeOnScroll, { passive: true });
  
        // Also close dropdown when clicking outside
        const closeOnClickOutside = (event) => {
          if (!drop.contains(event.target) && event.target !== button) {
            button.dataset.open = 'false';
            drop.style.visibility = 'hidden';
            drop.style.opacity = '0';
            const ribbon = button.closest('.ribbon');

            if (ribbon && window.innerWidth < 768) {
              ribbon.classList.remove('drop-opened');
            }

            document.removeEventListener('click', closeOnClickOutside);
            window.removeEventListener('wheel', closeOnScroll);
          }
        };
  
        document.addEventListener('click', closeOnClickOutside);
      });
    });
  };
  

  // Event delegation to handle various interactions
  document.addEventListener('click', (event) => {
    const target = event.target;
    const targetButton = target.closest('.button[data-open]');
    const clickedButton = event.target.closest('[hx-get][data-mode]');
    const selectAllLabel = target.closest('label')?.querySelector('input[name="toggle_all"]')?.closest('label');

    const applyButton = event.target.closest('.drop-footer .button:not([disabled])');

    if (applyButton) {
      const parentDrop = applyButton.closest('.drop');
      const toggleButton = parentDrop?.previousElementSibling;

      if (toggleButton?.matches('.button[data-open="true"]')) {
        toggleButton.dataset.open = 'false';
      }
    }

    if (clickedButton) {
      currentMode = clickedButton.dataset.mode; // Stores mode (Add / Edit)
    }

    if (targetButton) {
      const drop = targetButton.nextElementSibling;
      const isOpen = targetButton.dataset.open === 'true';
      const isInTableCell = targetButton.closest('td.cell-options');
      const ribbon = targetButton.closest('.ribbon');
      const isMobile = window.innerWidth < 768;
    
      if (isOpen) {
        targetButton.dataset.open = 'false';
        if (isInTableCell && drop?.classList.contains('drop')) {
          drop.style.visibility = 'hidden';
          drop.style.opacity = '0';
        }

        if (ribbon && isMobile) {
          ribbon.classList.remove('drop-opened');
        }
      } else {
        document.querySelectorAll('.button[data-open]').forEach(btn => btn.dataset.open = 'false');
        targetButton.dataset.open = 'true';

        if (ribbon && drop?.classList.contains('drop') && isMobile) {
          ribbon.classList.add('drop-opened');
        }

        if (isInTableCell) {
          positionDropdowns();
        }
      }
    }
       

    if (target.closest('.button')) {
      target.closest('.button').classList.add('was-clicked');
      setTimeout(() => target.closest('.button').classList.remove('was-clicked'), 200);
    }

    if (target.closest('[data-tab="closed"]')) {
      document.querySelectorAll('[data-tab]').forEach(tab => tab.dataset.tab = 'closed');
      target.closest('[data-tab="closed"]').dataset.tab = 'open';
    }

    if (target.closest('aside a')) {
      const parent = target.closest('li');
      const isCategoryHeader = parent.querySelector('ul');
    
      if (isCategoryHeader) {
        parent.dataset.open = parent.dataset.open !== 'true' ? 'true' : 'false';
      } else {
        document.querySelectorAll('aside li[data-active="true"]').forEach(item => item.removeAttribute('data-active'));
        parent.setAttribute('data-active', 'true');
        nav.setAttribute('data-open', 'false');
      }
    }

    if (target.closest('.select')) {
      const select = target.closest('.select');
      const label = target.closest('.options label[data-description]');
      select.dataset.open = !label ? 'true' : 'false';
      if (label) select.dataset.selection = label.textContent.trim();
    }

    if (target.closest('.nav-jump')) {
      nav.dataset.open = nav.dataset.open === 'true' ? 'false' : 'true';
      event.preventDefault();
    }

    if (target.closest('.nav-bg')) {
      nav.dataset.open = 'false';
    }

    // if (target.closest('.drop')) {
    //   target.closest('.drop').querySelectorAll('button[disabled]').forEach(button => button.removeAttribute('disabled'));
    // }

    if (selectAllLabel) toggleCheckboxes(selectAllLabel);

    if (target.closest('.drop-main > li > label > input[type="checkbox"]:not([name="toggle_all"])')) {
      const parentLabel = target.closest('ul').querySelector('input[name="toggle_all"]').closest('label');
      updateSelectAllState(parentLabel);
    }

    if (target.closest('button[data-toast]')) {
      const toastButton = target.closest('button[data-toast]');
      createToast(toastButton.dataset.toast, toastButton.dataset.toastTitle, toastButton.dataset.toastDescription);
    }

    // Close dropdown if clicked outside
    const openDropdown = document.querySelector('.button[data-open="true"]');
    if (openDropdown && !target.closest('.drop') && !target.closest('.button[data-open="true"]')) {
      openDropdown.setAttribute('data-open', 'false');
      
      const ribbon = openDropdown.closest('.ribbon');
      if (ribbon && window.innerWidth < 768) {
        ribbon.classList.remove('drop-opened');
      }
    }

    const applyRadioBtn = event.target.closest('#ribbon-events .is-events + .drop .drop-footer button');
    if (applyRadioBtn) {
      console.log('applied');
      const drop = applyRadioBtn.closest('.drop');
      if (drop && drop.querySelector('input[type="radio"][name="event_filter"]')) {
        console.log('boo');
      }
    }

    const applyBtn = event.target.closest('[data-chart-filters="events"] .drop-footer .button');

    if (!applyBtn) return;
  
    const container = applyBtn.closest('[data-chart-filters="events"]');
    const chart = Chart.getChart(document.querySelector('#chart-events'));
    if (!chart || !container) return;
  
    container.querySelectorAll('.drop-main input[type="checkbox"]:not([name="toggle_all"])').forEach(cb => {
      const idx = chart.data.datasets.findIndex(ds => (ds._filterName || ds.label) === cb.name);
      if (idx !== -1) {
        chart.setDatasetVisibility(idx, cb.checked);
      }
    });
    // rescale chart y-axis when filters change in order to zoom in or out to relevant data
    // if (chart.options.scales?.y) {
    //   chart.options.scales.y.min = undefined;
    //   chart.options.scales.y.max = undefined;
    // }
    chart.update();

    handleNavigationClick(event);
  });

  document.addEventListener('change', (event) => {
    const target = event.target;

    // Handle dropdown checkboxes
    if (target.closest('.drop')) {
      const drop = target.closest('.drop');
  
      if (target.name === 'toggle_all') {
        const checkboxes = drop.querySelectorAll('.drop-main input[type="checkbox"]:not([name="toggle_all"])');
        checkboxes.forEach(cb => cb.checked = target.checked);
      }

      enableApplyButton(drop);
      updateCounterButtons();
    }
  });

  document.addEventListener('input', (event) => {
    const drop = event.target.closest('.drop');
    if (!drop) return;
  
    enableApplyButton(drop);
  });

  // Filtering drop-main list items
  // Initialize search filtering
  const initializeDropSearch = (context = document) => {
    context.querySelectorAll('.drop-search').forEach(dropSearchForm => {
      const searchInput = dropSearchForm.querySelector('input[type="search"]');
      const dropMain = dropSearchForm.closest('.drop').querySelector('.drop-main');
      const listItems = dropMain.querySelectorAll('li:not(.toggle-all)');
      const toggleAll = dropMain.querySelectorAll('li.toggle-all');

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const searchValue = searchInput.value.toLowerCase();
          let matchFound = false;
          let anyItemHidden = false;
        
          listItems.forEach(item => {
            const label = item.querySelector('label');
            const isVisible = label && label.textContent.toLowerCase().includes(searchValue);
            item.dataset.visible = isVisible ? 'true' : 'false';
            matchFound = matchFound || isVisible;
            if (!isVisible) anyItemHidden = true;
          });
        
          // Handle "No matches" message
          let noMatchItem = dropMain.querySelector('.no-match');
          if (!matchFound && !noMatchItem) {
            noMatchItem = document.createElement('li');
            noMatchItem.classList.add('no-match');
            noMatchItem.innerHTML = '<label>No matches</label>';
            dropMain.appendChild(noMatchItem);
          } else if (matchFound && noMatchItem) {
            noMatchItem.remove();
          }
        
          // Handle toggleAll visibility: if searchValue is present and any item is hidden, hide toggleAll
          toggleAll.forEach(toggle => {
            if (searchValue && anyItemHidden) {
              toggle.dataset.visible = 'false';
            } else {
              toggle.removeAttribute('data-visible');
            }
          });
        });        

        dropSearchForm.addEventListener('submit', event => event.preventDefault());
      }
    });
  };

  const updateNavClass = () => {
    const nav = document.querySelector('nav');
    const aside = document.querySelector('#navigation'); // this is the aside
    if (!nav || !aside) return;
    if (aside.dataset.open === 'true') {
      nav.classList.add('sidebar-opened');
    } else {
      setTimeout(() => {
        nav.classList.remove("sidebar-opened");
      }, 300);
    }
  }

  const setActiveLinkAndTitle = () => {
    let activeLi = document.querySelector('aside#navigation li[data-active="true"]');
    let activeLink = activeLi?.querySelector('a');
  
    if (!activeLink) {
      activeLink = document.querySelector('aside#navigation a[hx-get]');
      if (activeLink) {
        activeLink.closest('li').setAttribute('data-active', 'true');
      }
    }
  }
  

  const handleNavigationClick = (event) => {
    const clickedLink = event.target.closest('a[hx-get]');
    if (!clickedLink) return;

    document.querySelectorAll('aside#navigation a[data-active="true"]').forEach(link => {
      link.removeAttribute('data-active');
    });

    clickedLink.setAttribute('data-active', 'true');

    updatePageTitle(clickedLink);
  }

  // Event listener for resize events
  window.addEventListener('resize', () => {
    manageNavBg();
    handleLabelsForMobile();
    adjustCheckboxLayout();
  });

  // Handle table scroll detection and cell sizing relative to the options column
  const handleTableScroll = (swappedElement) => {
    const tableContainer = swappedElement.querySelector('.table-container') || document.querySelector('.table-container');
    const panelHeader = swappedElement.querySelector('.panel-header') || document.querySelector('.panel-header');
    const optionsContainer = swappedElement.querySelector('.options-container') || document.querySelector('.options-container');
    const panelBlock = swappedElement.querySelector('.panel') || document.querySelector('.panel');
    const panelFooter = swappedElement.querySelector('.panel-footer') || document.querySelector('.panel-footer')
    
    if (tableContainer && optionsContainer) {
      const hasVerticalScroll = tableContainer.scrollHeight > tableContainer.clientHeight;
      const hasHorizontalScroll = tableContainer.scrollWidth > tableContainer.clientWidth;

      if (hasVerticalScroll) {
        optionsContainer.classList.add('scroll-vertical');
      } else {
        optionsContainer.classList.remove('scroll-vertical');
      }

      // Add "has-scrollbar" class to .table-block if either vertical or horizontal scrollbar exists
      // this is in order to create a pseudo-element to simulate the rounded corners of the table
      if (panelBlock && !panelFooter) {
        if (hasVerticalScroll && hasHorizontalScroll) {
          panelBlock.classList.add('has-scrollbars');
        } else if (hasVerticalScroll && !hasHorizontalScroll) {
          panelBlock.classList.add('has-side-scrollbar');
        } else if (!hasVerticalScroll && hasHorizontalScroll) {
          panelBlock.classList.add('has-bottom-scrollbar');
        } else {
          panelBlock.classList.remove('has-scrollbar', 'has-side-scrollbar', 'has-bottom-scrollbar');
        }
      }
    }

    if (optionsContainer && panelHeader) {
        panelHeader.classList.add('has-options');
    }
  };

  // Handle sticky table headers
  const handleStickyTableHeaders = (swappedElement) => {
    const tableBlock = swappedElement.querySelector('.table-block') || document.querySelector('.table-block');
    if (tableBlock) {
      const thElements = tableBlock.querySelectorAll('thead > tr > th');
      const tableBlockWidth = tableBlock.offsetWidth;

      thElements.forEach(th => {
        if (th.offsetWidth >= tableBlockWidth * 0.25) {
          if (!th.querySelector('.sticky-left')) {
            th.innerHTML = `<span class="sticky-left">${th.innerHTML}</span>`;
          }
        }
      });
    }
  };

  // Handle table footer and ribbon classes
  const handleTableFooterAndRibbon = (swappedElement) => {
    const tableContainer = swappedElement.querySelector('.table-container') || document.querySelector('.table-container');
    const panelFooter = swappedElement.querySelector('.panel-footer') || document.querySelector('.panel-footer');
    const ribbon = swappedElement.querySelector('.ribbon') || document.querySelector('.ribbon');

    if (tableContainer) {
      if (panelFooter) {
        tableContainer.classList.add('has-panel-footer');
      }
      if (ribbon) {
        tableContainer.classList.add('has-ribbon');
      }
    }
  }; 

  // Handle labels for mobile view
  const handleLabelsForMobile = () => {
    if (window.innerWidth < 768) {
      document.querySelectorAll('td.order-tertiary.label-cell').forEach(td => {
        const span = td.querySelector('span.label-event');
        if (span) {
          span.setAttribute('data-label', td.getAttribute('data-label'));
        }
      });
    }
  };

  // Handle table cell layout for mobile view when there are checkboxes present in the first cell
  const adjustCheckboxLayout = () => {
    const mobileBreakpoint = 767;
    const rows = document.querySelectorAll('tr');
  
    rows.forEach(row => {
      const firstCell = row.querySelector('td:first-child');
      const hasCheckbox = firstCell && firstCell.querySelector('input[type="checkbox"]');
      const primaryCell = row.querySelector('.order-primary');
      
      if (!primaryCell) return;
  
      if (window.innerWidth <= mobileBreakpoint && hasCheckbox) {
        primaryCell.classList.add('has-checkbox');
      } else {
        primaryCell.classList.remove('has-checkbox');
      }
    });
  };

  // Observe changes to the sidebar navigation and update class accordingly
  const asideObserver = new MutationObserver(updateNavClass);
  const asideEl = document.querySelector('#navigation');
  if (asideEl) {
    const asideObserver = new MutationObserver(updateNavClass);
    asideObserver.observe(asideEl, {
      attributes: true,
      attributeFilter: ['data-open'],
    });
  }

  // Handle chart filter toggling
  const bindChartFiltersPerComponent = (container) => {
  
    // find the <canvas> inside this component
    const chartEl = container.querySelector('canvas[id]');
    if (!chartEl) return;
  
    // grab the Chart.js instance
    const chart = Chart.getChart(chartEl);
    if (!chart) return;
  
    // for each checkbox whose name matches a dataset label...
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const idx = chart.data.datasets.findIndex(ds => ds.label === cb.name);
      if (idx !== -1) {
        // set initial visibility
        chart.setDatasetVisibility(idx, cb.checked);
      }
    });

    chart.update();
  }  
  
  const setupChartFiltersIfPresent = (root = document) => {
    const components = root.querySelectorAll('.chart-component');
    components.forEach(comp => {
      if (comp.querySelector('canvas[id]')) {
        bindChartFiltersPerComponent(comp);
      }
    });
  }

  // Connect every chart to its filter checkboxes by matching dataset.label with checkbox.name
  const bindChartFilters = () => {
    document.querySelectorAll('canvas[id^="chart-"]').forEach(canvas => {
      const chart = Chart.getChart(canvas);
      if (!chart) return;

      document
        .querySelectorAll('[data-chart-filters="events"] .drop-main input[type="checkbox"]').forEach((cb) => {
          const idx = chart.data.datasets.findIndex(
            (ds) => (ds._filterName || ds.label) === cb.name
          );
          if (idx !== -1) {
            chart.setDatasetVisibility(idx, cb.checked);
          }
        });

      // rescale chart y-axis when filters change in order to zoom in or out to relevant data
      if (chart.options.scales?.y) {
        chart.options.scales.y.min = undefined;
        chart.options.scales.y.max = undefined;
      }
      chart.update();
    });
  }

  const activateNavFromUrl = (url) => {
    if (!url) return;
    const normalizedUrl = url.replace(/^\/+/, '');
    const matchingLink = document.querySelector(`aside#navigation a[hx-get="${normalizedUrl}"]`);
    if (!matchingLink) {
      return;
    }
    const matchingLi = matchingLink.closest('li');
    if (!matchingLi) {
      return;
    }
  
    document.querySelectorAll('aside#navigation li[data-active="true"]')
      .forEach(li => li.removeAttribute('data-active'));
  
    matchingLi.setAttribute('data-active', 'true');
    updatePageTitle(matchingLink);
  };

  // Handle usage bar visualization, and cases when we have overage usage
  const updateUsageBars = (root = document) => {
    root.querySelectorAll(".usage").forEach((usageEl) => {
      const spans = usageEl.querySelectorAll(".progress-text span");
      const bar = usageEl.querySelector(".usage-bar");
      if (spans.length !== 2 || !bar) return;

      const current = parseInt(spans[0].textContent.replace(/,/g, ""));
      const total = parseInt(spans[1].textContent.replace(/,/g, ""));
      if (isNaN(current) || isNaN(total) || total === 0) return;

      // Reset
      usageEl.classList.remove("has-overage");
      bar.removeAttribute("data-overage");
      usageEl
        .querySelectorAll(".usage-bar-overage")
        .forEach((el) => el.remove());

      if (current > total) {
        usageEl.classList.add("has-overage");
        const tripledTotal = total * 3;
        const visiblePercent = 100 / 3; // always 33%
        const overagePercent = Math.round((current / tripledTotal) * 100);

        bar.style.width = `${visiblePercent}%`;

        const overageDiv = document.createElement("div");
        overageDiv.className = "usage-bar-overage";
        overageDiv.style.width = `${overagePercent}%`;
        bar.parentNode.appendChild(overageDiv);
      } else {
        const percent = Math.round((current / total) * 100);
        bar.style.width = `${percent}%`;
      }
    });
  };


  // All the functions that need to be called on page load
  manageNavBg();
  initializeSelectAll();
  initializeDropSearch();
  setActiveLinkAndTitle();
  updateNavClass();
  setupChartFiltersIfPresent();
  bindChartFilters();
  updateUsageBars();

  // event listeners for htmx events
  document.body.addEventListener('htmx:afterOnLoad', function () {
    const activeLi = document.querySelector('aside#navigation li[data-active="true"]');
    const link = activeLi?.querySelector('a');
    updatePageTitle(link);
  });

  document.body.addEventListener('htmx:afterSwap', (event) => {
    const url = event.detail?.requestConfig?.path;
    activateNavFromUrl(url);

    const swappedElement = event.detail.target;

    if (swappedElement.closest('.table-container table')) {
      positionDropdowns();
    }

    // Handle specific functionality
    handleTableScroll(swappedElement);
    handleStickyTableHeaders(swappedElement);
    handleLabelsForMobile();
    updateTitlePrefix();
    updateCounterButtons();
    updateNavClass();
    setupChartFiltersIfPresent(event.target);
    bindChartFilters();
    updateUsageBars(event.target);
    if (window.innerWidth >= 768) {
      handleTableFooterAndRibbon(swappedElement);
    }

    if (window.innerWidth < 768) {
      adjustCheckboxLayout();
    }
  });

  document.body.addEventListener('htmx:afterSettle', (event) => {
    initializeSelectAll(event.target);
    initializeDropSearch(event.target);
    updateUsageBars();
  });  
});
