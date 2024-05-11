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
			// Select the checkbox element by its ID.
			let checkbox = $( '.ultimakit_module_action' );
			// Add a change event listener to the checkbox.
			checkbox.on(
				'change',
				function (event) {
					let module_id     = jQuery( this ).attr( 'id' );
					let module_status = '';

					// The event object contains information about the change event.
					if (event.target.checked) {
						module_status = 'on';
					} else {
						module_status = 'off';
					}

					const restUrl   = ultimakit_ajax.url;
					const toastConf = {
						timeOut: 1500, // Adjust display time as needed (in milliseconds).
						positionClass: 'toast-top-right', // Adjust position as needed.
						progressBar: true, // Show a progress bar.
						closeButton: true,
						preventDuplicates: true,
						iconClasses: {
							success: "toast-success",
					        warning: "toast-warning" // Specify a single CSS class for warning messages.
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
									toastr.success( response.data.message, '', toastConf );
									if ( 'on' == module_status ) {
										jQuery( '.' + module_id ).show();
									} else {
										jQuery( '.' + module_id ).hide();
									}
								} else {
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
								console.log(response);
								if (response.success) {
									toastr.success( response.data.message, '', toastConf );
									setTimeout(
										function () {
											$( '.wpuk_modal' ).hide();
											window.location.reload();
										},
										2000
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
	                var category = $(this).data('category');
	                var status = $(this).data('status');
	                
	                var categoryMatch = (selectedCategory === 'all' || $(this).hasClass(selectedCategory));
	                var statusMatch = (selectedStatus === 'all' || $(this).hasClass(selectedStatus));

	                if (categoryMatch && statusMatch) {
	                     $(this).fadeIn();
	                } else {
	                    $(this).fadeOut();
	                }
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