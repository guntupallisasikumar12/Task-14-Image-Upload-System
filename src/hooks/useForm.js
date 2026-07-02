import { useState } from 'react'

export function useForm(initialValues, validate) {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})

    function handleChange(e) {
        const { name, value } = e.target
        setValues(prev => ({ ...prev, [name]: value }))
    }

    function setFieldValue(name, value) {
        setValues(prev => ({ ...prev, [name]: value }))
    }

    function validateForm() {
        const newErrors = validate(values)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    function resetForm() {
        setValues(initialValues)
        setErrors({})
    }

    return { values, errors, handleChange, setFieldValue, validateForm, resetForm }
}