import PersonIcon from '../../icons/contact-modal/person-icon/person.icon';
import MailIcon from '../../icons/contact-modal/mail-icon/mail.icon';
import WorkIcon from '../../icons/contact-modal/work-icon/work.icon';
import WebsiteIcon from '../../icons/contact-modal/website-icon/website.icon';

export const CONTACT_MODAL_ROWS = [
    {
        Icon: PersonIcon,
        inputs: [
            {
                name: 'First name',
                placeholder: 'First name',
                width: '137px',
            },
            {
                name: 'Last name',
                placeholder: 'Last name',
                width: '253px',
            },
        ],
    },
    {
        Icon: MailIcon,
        inputs: [
            { name: 'Email', type: 'email', placeholder: 'Email address' },
        ],
    },
    {
        Icon: WorkIcon,
        inputs: [
            {
                name: 'Institution name',
                placeholder: 'Institution name',
            },
        ],
    },
    {
        Icon: WebsiteIcon,
        inputs: [
            {
                name: 'Institution website',
                required: false,
                placeholder: 'Institution website',
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
