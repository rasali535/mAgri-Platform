<?php

namespace Hostinger\AffiliatePlugin\Dto\Amazon\AmazonItemDto;

if ( ! defined( 'ABSPATH' ) ) {
    die;
}

class ContributorDto {
    private string $locale;
    private string $name;
    private string $role;
    private string $role_type;

    public function __construct( string $locale, string $name, string $role, string $role_type ) {
        $this->locale    = $locale;
        $this->name      = $name;
        $this->role      = $role;
        $this->role_type = $role_type;
    }

    public function get_locale(): string {
        return $this->locale;
    }

    public function set_locale( string $locale ): void {
        $this->locale = $locale;
    }

    public function get_name(): string {
        return $this->name;
    }

    public function set_name( string $name ): void {
        $this->name = $name;
    }

    public function get_role(): string {
        return $this->role;
    }

    public function set_role( string $role ): void {
        $this->role = $role;
    }

    public function get_role_type(): string {
        return $this->role_type;
    }

    public function set_role_type( string $role_type ): void {
        $this->role_type = $role_type;
    }

    public static function from_array( array $data ): self {
        return new self(
            $data['Locale'] ?? '',
            $data['Name'] ?? '',
            $data['Role'] ?? '',
            $data['RoleType'] ?? '',
        );
    }
}
