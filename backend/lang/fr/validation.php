<?php

return [
    'accepted' => 'Le champ :attribute doit être accepté.',
    'email' => 'Le champ :attribute doit être une adresse e-mail valide.',
    'in' => 'La valeur sélectionnée pour :attribute est invalide.',
    'max' => [
        'string' => 'Le champ :attribute ne peut pas dépasser :max caractères.',
    ],
    'min' => [
        'string' => 'Le champ :attribute doit contenir au moins :min caractères.',
    ],
    'required' => 'Le champ :attribute est obligatoire.',
    'same' => 'Les champs :attribute et :other doivent correspondre.',
    'string' => 'Le champ :attribute doit être une chaîne de caractères.',
    'unique' => 'Cette valeur est déjà utilisée.',
    'confirmed' => 'La confirmation du champ :attribute ne correspond pas.',

    'attributes' => [
        'email' => 'e-mail',
        'password' => 'mot de passe',
        'fullName' => 'nom complet',
        'phone' => 'téléphone',
        'commune' => 'commune',
        'role' => 'rôle',
        'domain' => 'pôle',
        'metier' => 'métier',
        'bio' => 'présentation',
        'address' => 'adresse',
        'currentPassword' => 'mot de passe actuel',
        'newPassword' => 'nouveau mot de passe',
        'confirmPassword' => 'confirmation du mot de passe',
    ],

    'custom' => [
        'email' => [
            'unique' => 'Un compte existe déjà avec cet e-mail. Connectez-vous ou utilisez une autre adresse.',
        ],
        'password' => [
            'min' => 'Le mot de passe doit contenir au moins :min caractères.',
        ],
    ],
];
