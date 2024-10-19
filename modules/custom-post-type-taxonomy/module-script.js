/**
 * This is the javascript file for the module.
 *
 * @package UltimaKit_
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

	jQuery(document).ready(function ($) {

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

		if( $("#ultimakit_module_custom_Post_Type_Taxonomy_modal").length > 0 ) {

		    $('.modal-footer .btn-secondary').on('click', function (e) {
		        e.preventDefault();
		        window.location.reload();
		    });

		    $('#rew_slug').on('input', function() {
			    let value = $(this).val().replace(/[^a-z_-]/g, '').slice(0, 20); // Remove invalid chars, allow only a-z, _, -
			    $(this).val(value).css('border-color', value.length ? '' : 'red'); // Update value and border color
			    $('#slug-error').toggle(value.length < $(this).val().length); // Show error if chars were removed
			});

			$('.wpuk_save_module_settings').on('click', function (e) {
		        e.preventDefault();
				
				var mode = getParameterByName('mode');
				var cpt_id = getParameterByName('cpt_id');
				var page = getParameterByName('page');
				var ctx_id = getParameterByName('ctx_id');

		        // Array to hold data for all forms
			    var allFormsData = [];

				// Iterate over each form with the class module_settings
				$('.module_settings').each(function () {
					var formDataObject = {};
					var supports = [];

					$(this).serializeArray().forEach(function (field) {
						field.name === 'wp_supports[]' ? supports.push(field.value) : formDataObject[field.name] = field.value;
					});

					if (supports.length) formDataObject['supports'] = supports.join(',');

					allFormsData.push(formDataObject);
				});

				var form_data = new FormData();
				var action = ( 'wp-ultimakit-custom-taxonomies' === page ) ? 'save_custom_taxonomy' : 'save_custom_post_type';
				var id = ( 'wp-ultimakit-custom-taxonomies' === page ) ? ctx_id : cpt_id;

				form_data.append('action', action); // WordPress AJAX action
				form_data.append('nonce', ultimakit_custom_post_type.ajax_nonce); // Security nonce
				form_data.append('formData', JSON.stringify(allFormsData)); // Form data

				// Set mode and ID if in edit mode
				form_data.append('mode', ( 'edit' === mode ) ? mode : 'new');
				if ( 'edit' === mode ) {
					form_data.append('id', id);
				}

				$.ajax({
					url: ultimakit_custom_post_type.ajax_url, // WordPress admin AJAX URL
					type: 'POST',
					contentType: false,
					processData: false,
					data: form_data,
					beforeSend: function() {
						$('body').css('cursor', 'progress');
					},
					complete: function() {
						$('body').css('cursor', 'default');
					},
					success: function (response) {
						if( response.success == true ){
							toastr.success( response.data.message, '', toastConf );
							setTimeout(function(){
								window.location.href = ultimakit_custom_post_type.admin_url;
							},1000);
						}
					},
					error: function (response) {
						console.log(response);
						toastr.error( 'Taxonomy with the slug is already exists.', '', toastConf );
					}
				});
		    });
			
			// Function to get a parameter value by its name from the URL
			function getParameterByName(name) {
				var url = window.location.href;
				var params = new URLSearchParams(window.location.search);
				return params.get(name);
			}
		
			// Get the 'cpt_id' parameter from the URL
			var cpt_id = getParameterByName('cpt_id');
		
			// If the 'cpt_id' exists, trigger the AJAX call to fetch the data
			if (cpt_id) {
				fetchCPTData(cpt_id, 'cpt');
			}

			// Get the 'ctx_id' parameter from the URL
			var ctx_id = getParameterByName('ctx_id');
		
			// If the 'ctx_id' exists, trigger the AJAX call to fetch the data
			if (ctx_id) {
				fetchCPTData(ctx_id, 'ctx');
			}
		
			function fetchCPTData(cpt_id, type = 'cpt' ) {
				$.ajax({
					url: ultimakit_custom_post_type.ajax_url, // WordPress admin AJAX URL
					type: 'POST',
					dataType: 'json',
					data: {
						action: 'ultimakit_get_cpt_ctx_data', // WordPress AJAX action
						nonce: ultimakit_custom_post_type.ajax_nonce, // Security nonce
						cpt_id: cpt_id, // Pass the CPT ID from the URL
						ctx_id: ctx_id, // Pass the CPT ID from the URL
						type: type
					},
					success: function(response) {
						console.log(response);
						if (response.success) {
							$.each(response.data, function(key, value) {
								// Use jQuery to find the input by ID and set its value
								if( 'post_type_slug' === key ){
									$('#rew_slug').val(value);
								} else {
									if( 'settings' === key ){
										value = JSON.parse(value); // Parse if it's a JSON string
										$.each(value, function(key_x, value_x) {
											if('supports' === key_x){
												var supportsValues = value_x.split(',');
												// Iterate over each checkbox with name wp_supports[]
												$('input[name="wp_supports[]"]').each(function() {
													var checkboxValue = $(this).val();  // Get the value of the checkbox

													// If the checkbox value is in the split values, check it
													if (supportsValues.includes(checkboxValue)) {
														$(this).prop('checked', true);
													} else {
														$(this).prop('checked', false); // Uncheck if not matched
													}
												});
											} else {
												$('#' + key_x).val(value_x);
											}
										});
									} else {
										$('#' + key).val(value);
									}
								}
							});
						} else {
							toastr.error( 'Error fetching CPT data: ' + response.data, '', toastConf );
						}
					},
					error: function() {
						toastr.error( 'An error occurred while fetching the CPT data.', '', toastConf );
					}
				});
			}
	    }


		if( $("#custom-post-types").length > 0 ) {

			if( $('.cpt_status').length > 0 ) {
				$('.cpt_status').change(function() {
					var isChecked = $(this).is(':checked');
					var id = $(this).attr('data-id'); 
					var status = isChecked ? '1' : '0';

					var form_data = new FormData();
					form_data.append( 'action', 'ultimakit_change_cpt_status' ); // WordPress AJAX action
					form_data.append( 'nonce', ultimakit_custom_post_type.ajax_nonce ); // Security nonce
					form_data.append( 'status', status );
					form_data.append( 'id', id );

					$.ajax({
						url: ultimakit_custom_post_type.ajax_url, // WordPress admin AJAX URL
						type: 'POST',
						contentType: false,
						processData: false,
						data: form_data,
						success: function (response) {
							if( response.success == true ){
								toastr.success( response.data, '', toastConf );

								setTimeout(function(){
									window.location.reload();
								},1000);

							}
							
						},
						error: function (response) {
							toastr.error( response.data, '', toastConf );
						}
					});
				});
			}

			if( $('.ultimakit_cpt_action').length > 0 ) {
				$('.ultimakit_cpt_action').click(function(e) {
					var id = $(this).attr('data-id'); 
					var mode = $(this).attr('data-mode'); 
					
					if( 'delete' == mode ){
						e.preventDefault();
						var form_data = new FormData();
						form_data.append( 'action', 'ultimakit_delete_cpt' ); // WordPress AJAX action
						form_data.append( 'nonce', ultimakit_custom_post_type.ajax_nonce ); // Security nonce
						form_data.append( 'id', id );
						$.ajax({
							url: ultimakit_custom_post_type.ajax_url, // WordPress admin AJAX URL
							type: 'POST',
							contentType: false,
							processData: false,
							data: form_data,
							success: function (response) {
								if( response.success == true ){
									toastr.success( response.data, '', toastConf );
								}

								setTimeout(function(){
									window.location.reload();
								},2000);
							},
							error: function (response) {
								toastr.error( response.data, '', toastConf );
							}
						});
					}

					
				});
			}
			
		}
		
		if( $("#custom-taxonomies").length > 0 ) {
			if( $('.ctx_status').length > 0 ) {
				$('.ctx_status').change(function() {
					var isChecked = $(this).is(':checked');
					var id = $(this).attr('data-id'); 
					var status = isChecked ? '1' : '0';

					var form_data = new FormData();
					form_data.append( 'action', 'ultimakit_change_ctx_status' ); // WordPress AJAX action
					form_data.append( 'nonce', ultimakit_custom_post_type.ajax_nonce ); // Security nonce
					form_data.append( 'status', status );
					form_data.append( 'id', id );

					$.ajax({
						url: ultimakit_custom_post_type.ajax_url, // WordPress admin AJAX URL
						type: 'POST',
						contentType: false,
						processData: false,
						data: form_data,
						success: function (response) {
							if( response.success == true ){
								toastr.success( response.data, '', toastConf );

								setTimeout(function(){
									window.location.reload();
								},1000);

							}
							
						},
						error: function (response) {
							toastr.error( response.data, '', toastConf );
						}
					});
				});
			}

			if( $('.ultimakit_ctx_action').length > 0 ) {
				$('.ultimakit_ctx_action').click(function(e) {
					var id = $(this).attr('data-id'); 
					var mode = $(this).attr('data-mode'); 
					
					if( 'delete' == mode ){
						e.preventDefault();
						var form_data = new FormData();
						form_data.append( 'action', 'ultimakit_delete_ctx' ); // WordPress AJAX action
						form_data.append( 'nonce', ultimakit_custom_post_type.ajax_nonce ); // Security nonce
						form_data.append( 'id', id );
						$.ajax({
							url: ultimakit_custom_post_type.ajax_url, // WordPress admin AJAX URL
							type: 'POST',
							contentType: false,
							processData: false,
							data: form_data,
							success: function (response) {
								if( response.success == true ){
									toastr.success( response.data, '', toastConf );
								}

								setTimeout(function(){
									window.location.reload();
								},2000);
							},
							error: function (response) {
								toastr.error( response.data, '', toastConf );
							}
						});
					}

					
				});
			}
		}
	    

	});


})( jQuery );