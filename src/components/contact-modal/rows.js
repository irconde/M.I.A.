import ArrowIcon from '../../icons/shared/arrow-icon/arrow.icon';

export const CONTACT_MODAL_ROWS = [
    {
        Icon: ArrowIcon,
        inputs: [
            {
                name: 'First Name',
                placeholder: 'First Name',
                width: '137px',
            },
            {
                name: 'Last Name',
                placeholder: 'Last Name',
                width: '253px',
            },
        ],
    },
    {
        Icon: ArrowIcon,
        inputs: [{ name: 'Email', type: 'email', placeholder: 'Email' }],
    },
    {
        Icon: ArrowIcon,
        inputs: [
            {
                name: 'Institution Name',
                placeholder: 'Institution Name',
            },
        ],
    },
    {
        Icon: ArrowIcon,
        inputs: [
            {
                name: 'Institution Website',
                required: false,
                placeholder: 'Institution Website',
            },
        ],
    },
    {
        Icon: null,
        inputs: [
            {
                name: 'Message',
                placeholder: 'Message',
                multiline: true,
                required: false,
                rows: 4,
                variant: 'outlined',
            },
        ],
    },
];
