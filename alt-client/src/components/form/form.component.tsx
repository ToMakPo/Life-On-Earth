import './form.styles.scss'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = (props: FormProps) => {
	const { className, children, ...rest } = props

	const classNames = ['form-component', className?.split(' ')].flat().filter(Boolean).join(' ')

	return <form className={classNames} {...rest}>{children}</form>
}

export default Form
