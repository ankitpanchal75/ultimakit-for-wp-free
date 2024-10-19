/**
 * This is the javascript file for the module.
 *
 * @package UltimaKit
 */

(function ( $ ) {
	'use strict';

	/**
	 * All of the code for your admin-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practise to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	jQuery( document ).ready(
		function ($) {	

			// Export settings
		    $('#ultimakit_export_settings').on('click', function(e) {
		        e.preventDefault();

		      	$.ajax({
				    url: ultimakit_ajax.url,
				    type: 'POST',
				    data: {
				        action: 'export_ultimakit_settings',
				    },
				    success: function (response) {
				        window.location.href = ultimakit_ajax.url + '?action=export_ultimakit_settings&nonce=' + ultimakit_ajax.nonce;
				    },
				    error: function () {
				        toastr.error('Error: AJAX request failed');
				    },
				});
		    });

		    // Import settings
		    $('#ultimakit_import_settings').on('change', function(e) {
		        e.preventDefault();

		        var file_data = $('#ultimakit_import_settings').prop('files')[0];
		        var form_data = new FormData();
		        form_data.append('json_file', file_data);
		        form_data.append('action', 'import_ultimakit_settings'); // WordPress AJAX action
		        form_data.append('nonce', ultimakit_ajax.nonce); // Security nonce

		        const toastConf = {
					timeOut: 1000, // Adjust display time as needed (in milliseconds).
					positionClass: 'toast-top-right', // Adjust position as needed.
					progressBar: true, // Show a progress bar.
					closeButton: true,
					preventDuplicates: true,
					iconClasses: {
						success: "toast-success",
				        warning: "toast-warning" // Specify a single CSS class for warning messages.
				    },
				};

		        $.ajax({
		            url: ultimakit_ajax.url, // WordPress admin AJAX URL
		            type: 'POST',
		            contentType: false,
		            processData: false,
		            data: form_data,
		            success: function (response) {
		            	toastr.success( 'Settings have been imported successfully.', '', toastConf );

		            	setTimeout(function(){
		            		window.location.reload();
		            	},1000);
		            },
		            error: function (response) {
		                toastr.error( 'Failed to import settings.', '', toastConf );
		            }
		        });

		    });

			let settingsActions = $( '.ultimakit_settings_action' );
			settingsActions.on(
				'change',
				function (event) {
					const restUrl   = ultimakit_ajax.url;
					const toastConf = {
						timeOut: 1000, // Adjust display time as needed (in milliseconds).
						positionClass: 'toast-top-center', // Adjust position as needed.
						progressBar: true, // Show a progress bar.
						closeButton: true,
						preventDuplicates: true,
						iconClasses: {
							success: "toast-success",
					        warning: "toast-warning" // Specify a single CSS class for warning messages.
					    },
					};

					// The event object contains information about the change event.
					if (event.target.checked) {
						status = 'on';
					} else {
						status = 'off';
					}

					// Make a REST API request.
					$.ajax(
					{
						url: restUrl, // Use your endpoint route.
						type: 'POST',
						data: {
							action: 'ultimakit_uninstall_settings',
							stat: status,
							nonce: ultimakit_ajax.nonce,
						},
						beforeSend: function (xhr) {
							xhr.setRequestHeader( 'X-WP-Nonce', ultimakit_ajax.nonce ); // Include the nonce in the request header.
						},
						success: function (response) {
							toastr.success( 'Settings Updated', '', toastConf );
						},
						error: function () {
							// Handle errors.
							toastr.error( 'Error: AJAX request failed', '', toastConf );
						},
					});
				}
			);

			// Select the checkbox element by its ID.
			let checkbox = $( '.ultimakit_module_action' );
			// Add a change event listener to the checkbox.
			checkbox.on(
				'change',
				function (event) {
					let module_id     = jQuery( this ).attr( 'id' );
					let module_status = '';
					let module_name = jQuery( this ).attr( 'module-name' );

					// The event object contains information about the change event.
					if (event.target.checked) {
						module_status = 'on';
					} else {
						module_status = 'off';
					}

					const restUrl   = ultimakit_ajax.url;
					const toastConf = {
						timeOut: 1500, // Adjust display time as needed (in milliseconds).
						positionClass: 'toast-top-center', // Adjust position as needed.
						progressBar: true, // Show a progress bar.
						closeButton: true,
						preventDuplicates: true,
						"showEasing": "linear",
						"hideEasing": "linear",
						"showMethod": "fadeIn",
						"hideMethod": "fadeOut",
						iconClasses: {
							success: "toast-success",
					        warning: "toast-warning" 
					    },
					};
					// Make a REST API request.
					$.ajax(
						{
							url: restUrl, // Use your endpoint route.
							type: 'POST',
							data: {
								action: 'ultimakit_update_settings',
								module_id: module_id,
								module_status: module_status,
								nonce: ultimakit_ajax.nonce,
							},
							beforeSend: function (xhr) {
								xhr.setRequestHeader( 'X-WP-Nonce', ultimakit_ajax.nonce ); // Include the nonce in the request header.
							},
							success: function (response) {
								if ('on' === response.data.status) {
									toastr.success( module_name + ' ' + response.data.message, '', toastConf );
									if ( 'on' == module_status ) {
										jQuery( '.' + module_id ).show();
									} else {
										jQuery( '.' + module_id ).hide();
									}
									setTimeout(
										function () {
											window.location.reload();
										},
										1500
									);
								} else {
									toastr.error( module_name + ' ' + response.data.message, '', toastConf );

									setTimeout(
										function () {
											window.location.reload();
										},
										1500
									);
								}
							},
							error: function () {
								// Handle errors.
								toastr.error( 'Error: AJAX request failed', '', toastConf );
							},
						}
					);
				}
			);

			$( '.module_settings' ).submit(
				function (e) {
					e.preventDefault(); // Prevent the default form submit.
					let settingData = {};
					let module_id   = $( this ).attr( 'id' );

					$( '#' + module_id ).find( ':input' ).each(
						function () {
							if (this.name && ! this.disabled) {
								if ( 'checkbox' == this.type || 'radio' == this.type ) {
									if ($( this ).prop( 'checked' )) {
										settingData[this.name] = 'on';
									} else {
										settingData[this.name] = 'off';
									}
								} else {
									if( this.type !== 'html' ){
										settingData[this.name] = $( this ).val();
									}
								}
							}
						}
					);

					let customOption = null;
					if ($('.wpuk_save_module_settings').length > 0) {
					    customOption = $('.wpuk_save_module_settings').attr('custom-option');
						settingData['custom_option'] = customOption;
					}

					// You can use 'inputData' as needed, like sending to server via AJAX.
					const restUrl   = ultimakit_ajax.url;
					const toastConf = {
						timeOut: 1000, // Adjust display time as needed (in milliseconds).
						positionClass: 'toast-top-right', // Adjust position as needed.
						progressBar: true, // Show a progress bar.
						closeButton: true,
						preventDuplicates: true,
						iconClasses: {
							success: "toast-success",
					    },
					};

					// Make a REST API request.
					$.ajax(
						{
							url: restUrl, // Use your endpoint route.
							type: 'POST',
							data: {
								action: 'ultimakit_update_settings',
								module_id: module_id.replace( '_form', '' ),
								module_settings: settingData,
								nonce: ultimakit_ajax.nonce,
								save_mode: 'settings'
							},
							beforeSend: function (xhr) {
								xhr.setRequestHeader( 'X-WP-Nonce', ultimakit_ajax.nonce ); // Include the nonce in the request header.
							},
							success: function (response) {
								if (response.success) {
									toastr.success( response.data.message, '', toastConf );
									setTimeout(
										function () {
											$( '.wpuk_modal' ).hide();
											window.location.reload();
										},
										1000
									);
								} else {
									// Display an error toast.
									toastr.success( 'Success: ' + response.data.message, '', toastConf );
								}
							},
							error: function () {
								// Handle errors.
								toastr.error( 'Error: AJAX request failed', '', toastConf );
							},
						}
					);
				}
			);

			$('#ultimakit_category, #ultimakit_status').change(function() {
	            var selectedCategory = $('#ultimakit_category').val();
	            var selectedStatus = $('#ultimakit_status').val();

	            $('.module-block').each(function() {	
	                
	                var categoryMatch = (selectedCategory === 'all' || $(this).hasClass(selectedCategory));
	                var statusMatch = (selectedStatus === 'all' || $(this).hasClass(selectedStatus));

	                if (categoryMatch && statusMatch) {
	                     $(this).fadeIn();
	                } else {
	                    $(this).fadeOut();
	                }
	            });
	        });

			$('#ultimakit_plans').on('change', function() {
				const selectedPlan = $(this).val();
				console.log(selectedPlan);
				// Show/Hide modules based on dropdown selection
				$('.module-box').each(function() {
					const $module = $(this);
					
					// Show all modules if "All Plans" is selected
					if (selectedPlan === 'all') {
						$module.closest('.module-block').show();
					} else {
						// Check if the module has the class matching the selected plan
						if ($module.hasClass(selectedPlan)) {
							$module.closest('.module-block').show();
						} else {
							$module.closest('.module-block').hide();
						}
					}
				});
			});
			

			$('#ultimakit_search_module').on('input', function(e) {
				// Avoid processing if Enter key is pressed
				const query = $(this).val().toLowerCase();
			
				// If input is cleared, reset the modules display and counts
				if (query.length === 0) {
					$('.module-block').show();
					$("#wp-modules-tab").find('span').remove();
					$("#wc-modules-tab").find('span').remove();
					return;
				}
			
				// Continue only if query length is at least 2
				if (query.length < 2) return;
			
				let wpModules = 0, wcModules = 0;
			
				// Loop through each module-block and toggle visibility based on match
				$('.module-block').each(function() {
					const $module = $(this);
					const title = $module.find('.module-title').text().toLowerCase();
					const description = $module.find('.module-description').text().toLowerCase();
			
					const isMatch = title.includes(query) || description.includes(query);
					$module.toggle(isMatch);
			
					// Increment count if match is found
					if (isMatch) {
						if ($module.find('.module-box').hasClass('WordPress')) wpModules++;
						if ($module.find('.module-box').hasClass('WooCommerce')) wcModules++;
					}
				});
			
				// Update the counts in tabs using your custom function
				wpuk_updateTabCount("#wp-modules-tab", wpModules);
				wpuk_updateTabCount("#wc-modules-tab", wcModules);
			
				// Check which count is higher and alert the user
				if (wpModules > 0 || wcModules > 0) {
					const higherValue = Math.max(wpModules, wcModules);
					const higherCategory = wpModules > wcModules ? 'wp-modules' : 'wc-modules';
					$('#'+higherCategory).addClass('active show');
					$('#wpukTabs li a').removeClass('active');
					$('#'+higherCategory+'-tab').addClass('active');
				}
			});
			
			// Function to dynamically add or update tab count
			function wpuk_updateTabCount(tabSelector, count) {
				const $tab = $(tabSelector);
				const $span = $tab.find('span');
			
				// If span doesn't exist, create it
				if ($span.length === 0) {
					$tab.append('<span>' + count + '</span>');
				} else {
					$span.text(count);
				}
			}
			
			// Remove span tags on page refresh
			$(window).on('beforeunload', function() {
				$("#wp-modules-tab").find('span').remove();
				$("#wc-modules-tab").find('span').remove();
			});
			
			function ultimakit_update_module_width( view = 'full' ) {
				$.ajax({
				    url: ultimakit_ajax.url,
				    type: 'POST',
				    data: {
				        action: 'ultimakit_update_module_width',
						view: view,
						nonce: ultimakit_ajax.nonce
				    },
				    success: function (response) {
				    },
				    error: function (error) {
				        toastr.error('Error: AJAX request failed');
				    },
				});
			}

		    $('#ultimakit_small_screen').on('click', function(e) {
		    	e.preventDefault();

				ultimakit_update_module_width('small');

		    	 // Loop through each module-block
		        $('.module-block').each(function() {
		        	$(this).find('.module-description').hide();
		        	$(this).find('.module-box').css('height','100px');
		        });

		    });

		    $('#ultimakit_full_screen').on('click', function(e) {
		    	e.preventDefault();

				ultimakit_update_module_width('full');

		    	 // Loop through each module-block
		        $('.module-block').each(function() {
		        	$(this).find('.module-description').show();
		        	$(this).find('.module-box').css('height','200px');
		        });
		    });
			
		}
	);
	

	

	
	document.addEventListener('DOMContentLoaded', function() {
	    var texts = document.querySelectorAll('selector-for-element-containing-text'); // Replace with actual selector
	    texts.forEach(function(element) {
	        if (element.textContent.includes('W00t! Premium plugin version was successfully activated.')) {
	            element.textContent = element.textContent.replace('W00t! Premium plugin version was successfully activated.', 'Ultimakit For WP Pro plugin version was successfully activated.');
	        }
	    });
	});



})( jQuery );