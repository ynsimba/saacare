<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Destinataires du formulaire /contact
    |--------------------------------------------------------------------------
    |
    | Liste d’e-mails séparés par des virgules (env CONTACT_RECIPIENTS).
    |
    */
    'recipients' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('CONTACT_RECIPIENTS', 'hello@saacare.com,sephorasoki@saacare.com'))
    ))),
];
