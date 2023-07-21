import { useState } from 'react'

export const Toggle = ({ label, toggled, onClick }) => {
    const [isToggled, toggle] = useState("girl"); // "girl" for Girlish theme, "boy" for Boyish theme
    // const [theme, setTheme] = useState("girl"); // "girl" for Girlish theme, "boy" for Boyish theme


    const callback = () => {
        toggle(!isToggled)
        onClick(!isToggled)
    }

    return (
        <label id="toggle-label">
            <input type="checkbox" defaultChecked={isToggled} onClick={callback} id="toggle-input" />
            <span id="toggle-span" />
            <strong id="toggle-strong">{label}</strong>
        </label>
    )
};