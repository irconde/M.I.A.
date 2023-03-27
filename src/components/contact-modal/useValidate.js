import React, { useState } from 'react';

function UseValidate() {
    const [error, _setError] = useState({ name: '', text: '' });

    /**
     *
     * @return {true}
     */
    const resetError = () => {
        setError({ name: '', text: '' });
        return true;
    };

    /**
     *
     * @param error {{name: string, text: string}}
     * @return {false}
     */
    const setError = (error) => {
        _setError(error);
        return false;
    };

    /**
     *
     * @param formElement {HTMLFormElement}
     * @return {Array<{name: string, value: string, type: string}>}
     */
    function getFormValues(formElement) {
        const formValues = [];
        const elements = formElement.elements;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const { name, value, type, required } = element;
            if (type === 'submit' || type === 'reset' || !name || !required) {
                continue;
            }

            formValues.push({ name, value, type });
        }

        return formValues;
    }

    /**
     *
     * @param form {HTMLFormElement}
     * @returns {boolean} true if the form is valid, false if not
     */
    const validate = (form) => {
        const fields = getFormValues(form);
        for (const { type, name, value } of fields) {
            switch (type) {
                case 'text':
                    if (value.trim()) break;
                    return setError({ name, text: 'Field is missing' });
                case 'email':
                    if (!value.trim())
                        return setError({ name, text: 'Field is missing' });
                    else if (!/\S+@\S+\.\S+/.test(value)) {
                        return setError({
                            name,
                            text: 'Email format is invalid',
                        });
                    }
                    break;

                default:
                    throw new Error('Unknown field type to validate');
            }
        }

        return resetError();
    };

    return [error, validate, resetError];
}

export default UseValidate;
