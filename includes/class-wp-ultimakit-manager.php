<?php
class UltimaKit_Module_Manager extends UltimaKit_Helpers {
	public $module_settings;
	protected $ID = '';
	protected $name;
	protected $description;
	protected $plan     = 'free';
	protected $category = '';
	protected $type     = '';
	protected $is_active;
	protected $read_more_link = 'https://www.wpultimakit.com';
	protected $settings       = 'no';
	protected $settings_link  = '#';
	public $modules;
	public $module_settings_obj;

	public function __construct() {
		$this->ultimakit_initializeModules();
		add_action( 'wp_ajax_ultimakit_update_settings', array( $this, 'ultimakit_update_settings' ) );
	}

	public function ultimakit_initializeModules() {
	    $modules_directory = ULTIMAKIT_FOR_WP_PATH . 'modules/';

	    if ( is_dir( $modules_directory ) ) {
	        $module_folders = glob( $modules_directory . '*', GLOB_ONLYDIR );

	        foreach ( $module_folders as $module_folder ) {
	            $module_name = basename( $module_folder );
	            $module_file = $module_folder . '/class-wpultimakit-module-' . $module_name . '.php';
	            if ( file_exists( $module_file ) ) {
	                require_once $module_file;
	                $class_name = 'UltimaKit_Module_' . ucfirst( str_replace( '-', '_', $module_name ) );
	                if ( class_exists( $class_name ) ) {
	                    $this->modules[] = new $class_name();
	                } else {
	                    // Handle class not found error.
	                }
	            }
	        }
	    }
	}


	public function getAllCategories() {
		$all_categories = '';
		$all_categories_array = [];
		foreach ( $this->modules as $module ) {
			$all_categories_array[] = $module->getCategory();
			
		}
		// Remove duplicate values from the array
		$all_categories_array = array_unique($all_categories_array);

		// Sort the array alphabetically
		sort($all_categories_array);

		// Now $all_categories_array is sorted alphabetically

		foreach ( $all_categories_array as $category ) {
			echo '<option value="'.esc_html($category).'">'.esc_html($category).'</option>';
		}
		// echo $all_categories;
	}

	public function getAllModules( $type = 'free' ) {
		$all_module_info = array();
		foreach ( $this->modules as $module ) {
			if( $type === $module->getPlan() ){
				$module_info       = array(
					'id'            => $module->getID(),
					'name'          => $module->getName(),
					'description'   => $module->getDescription(),
					'category'      => $module->getCategory(),
					'plan'          => $module->getPlan(),
					'type'          => $module->getType(),
					'link'          => $module->getLink(),
					'is_active'     => $this->isModuleActive( $module->getID() ),
					'settings'      => $module->getSettings(),
					'settings_link' => $module->getSettingsLink(),
				);
				$all_module_info[] = $module_info;
			}
		}

		if ( $type === 'json' ) {
			return $this->get_pro_modules();
		}
		return $all_module_info;
	}

	public function get_pro_modules() {
	    // Define the path to the JSON file
	    $dir = plugin_dir_path(__FILE__);
	    $filePath = $dir . 'pro-modules.json';

	    // Check if the file exists
	    if (!file_exists($filePath)) {
	        echo "File not found";
	        return null; // Return null or handle the error as appropriate
	    }

	    // Read th e JSON file contents
	    $jsonContent = file_get_contents($filePath);
	    if ($jsonContent === false) {
	        echo "Failed to read from file";
	        return null; // Handle error appropriately
	    }

	    // Decode the JSON content into a PHP array
	    $data = json_decode($jsonContent, true); // Passing true to convert objects to associative arrays
	    if ($data === null) {
	        echo "Failed to decode JSON";
	        return null; // Handle JSON decoding errors
	    }

	    return $data;
	}

	public function isModuleActive( $moduleID ) {
		$ultimakitManager = new UltimaKit();
		// Check if the object is created successfully and the property exists
		if ( $ultimakitManager && property_exists( $ultimakitManager, 'module_settings' ) ) {
			$this->module_settings = $ultimakitManager->module_settings;
		} else {
			// Handle the error as you see fit, e.g., throw an exception or log an error.
			error_log( 'Failed to get module settings from UltimaKit.' );
		}
		return isset( $this->module_settings[ $moduleID ] ) && isset($this->module_settings[ $moduleID ]['enabled']) && $this->module_settings[ $moduleID ]['enabled'] == 'on';
	}


	public function getID() {
		return $this->ID;
	}

	public function getName() {
		return $this->name;
	}

	public function getDescription() {
		return $this->description;
	}

	public function getCategory() {
		return $this->category;
	}

	public function getPlan() {
		return $this->plan;
	}

	public function getType() {
		return $this->type;
	}

	public function getLink() {
		return $this->read_more_link;
	}

	public function getSettings() {
		return ( $this->settings ) ? $this->settings : 'no';
	}

	public function getSettingsLink() {
		return ( $this->settings_link ) ? $this->settings_link : '#';
	}

	public function getModuleSettings( $module_id = '', $key = '' ) {
		$this->module_settings_obj = get_option( 'ultimakit_options', true );
		if ( isset( $this->module_settings_obj[ $module_id ]['settings'][ $key ] ) ) {
			return $this->module_settings_obj[ $module_id ]['settings'][ $key ];
		}
		return false;
	}

	public function setModuleStatus( $module_id, $module_status ) {
		$module_settings                          = get_option( 'ultimakit_options', true );
		$module_settings[ $module_id ]['enabled'] = $module_status;
		return update_option( 'ultimakit_options', $module_settings );
	}

	public function setModuleSettings( $module_id, $module_settings_ar ) {
		$module_settings = get_option( 'ultimakit_options', true );

		$module_settings_ar = array_map(
			function ( $value ) {
				return $value;
			},
			$module_settings_ar
		);

		$module_settings[ $module_id ]['settings'] = $module_settings_ar;
		update_option( 'ultimakit_options', $module_settings );
	}

	public function ultimakit_update_settings() {

		// Verify the nonce
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'ultimakit_nonce' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ultimakit-for-wp' ) ), 401 );
		}

		$module_id       = sanitize_text_field( $_POST['module_id'] );
		$module_status   = sanitize_text_field( $_POST['module_status'] );
		
		if( is_array($_POST['module_settings']) ){
			$module_settings = array_map(
				function ( $value ) {
					return sanitize_text_field( $value );
				},
				$_POST['module_settings']
			);
		} else {
			$module_settings = sanitize_text_field( $_POST['module_settings'] );
		}

		$save_mode       = sanitize_text_field( $_POST['save_mode'] );
		$response        = array();
		if ( 'settings' == $save_mode ) {
			$this->setModuleSettings( $module_id, $module_settings );
			$response = array( 'message' => __( 'Module Settings Saved Successfully', 'ultimakit-for-wp' ) );
		} elseif ( 'on' === $module_status ) {
			$this->setModuleStatus( $module_id, $module_status );
			$response = array( 'message' => __( 'Module Enabled Successfully', 'ultimakit-for-wp' ), 'status' => 'on' );
			do_action('ultimakit_module_action_fired', $module_id, $module_status );

		} elseif ( 'off' === $module_status ) {
			$this->setModuleStatus( $module_id, $module_status );
			$response = array( 'message' => __( 'Module Disabled Successfully', 'ultimakit-for-wp' ), 'status' => 'off' );
			do_action('ultimakit_module_action_fired', $module_id, $module_status );
		}
		wp_send_json_success( $response );
	}
}
