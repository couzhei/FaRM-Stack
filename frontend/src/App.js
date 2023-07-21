import "antd/dist/antd.css";
import { CheckCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Col, Form, Input, Row, Timeline } from "antd";
import { useEffect, useState, useRef } from "react";
import "./App.css"; // Import the custom CSS file
import { Toggle } from './components/Toggle';
import './components/Toggle.css';
import ReactDatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function getBackgroundColor(theme) {
    if (theme === "boy") return "#e2f3df";
    else return "#ede3e2";
}

function App() {
    const [tasks, setTasks] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [theme, setTheme] = useState("girl"); // "girl" for Girlish theme, "boy" for Boyish theme
    // Other state variables...
    const [startOn, setStartOn] = useState(null);
    const [deadlineOn, setDeadlineOn] = useState(null);
    const formRef = useRef(null);

    // Function to handle the DatePicker change for start_on
    const handleStartOnChange = (date) => {
        setStartOn(date);
    };

    // Function to handle the DatePicker change for deadline_on
    const handleDeadlineOnChange = (date) => {
        setDeadlineOn(date);
    };

    // Function to toggle between themes
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "girl" ? "boy" : "girl"));
    };


    useEffect(() => {
        const fetchAllTasks = async () => {
            const response = await fetch("/task/");
            const fetchedTasks = await response.json();
            setTasks(fetchedTasks);
        };

        const interval = setInterval(fetchAllTasks, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []); // Add 'theme' to the dependency array

    useEffect(() => {
        // Create a copy of the tasks array and then reverse it
        const reversedTasks = [...tasks].reverse();
        const timelineItems = reversedTasks.map((task) => {
            const createdOnDate = new Date(task.created_on);
            const formattedCreatedOn = createdOnDate.toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
            });
            return task.completed ? (
                <Timeline.Item
                    key={`completed-${task._id}`} // Add a unique key for completed tasks
                    dot={<CheckCircleOutlined />}
                    className={`${theme}-theme`} // Add the theme class to the Timeline.Item
                    style={{
                        textDecoration: "line-through",
                        color: "green",
                        backgroundColor: getBackgroundColor(theme)
                    }}
                >
                    {task.name} {task.created_on && <small>({formattedCreatedOn})</small>}
                </Timeline.Item>
            ) : (
                <Timeline.Item
                    key={`pending-${task._id}`} // Add a unique key for completed tasks
                    dot={<MinusCircleOutlined />}
                    className={`${theme}-theme`} // Add the theme class to the Timeline.Item
                    style={{
                        textDecoration: "initial",
                        backgroundColor: getBackgroundColor(theme)
                    }}
                >
                    {task.name} {task.created_on && <small>({formattedCreatedOn})</small>}
                </Timeline.Item>
            );
        });

        setTimeline(timelineItems);
    }, [tasks, theme]);

    const onFinish = async (values) => {
        // Send the form data to the backend to create a new task
        try {
            const response = await fetch("/task/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                const createdTask = await response.json();
                setTasks([createdTask, ...tasks]);

                // clear form inputs after successful insertion
                setStartOn(null);
                setDeadlineOn(null);
                formRef.current.resetFields(); // reset the form fields 
            } else {
                console.error("Failed to create task");
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    return (
        <>

            <div className={`app-container ${theme}-theme`}>
                <Toggle
                    label="Theme"
                    toggled={true}
                    onClick={toggleTheme}
                    className="Toggly"
                />
                <Row gutter={[16, 16]} className={`app-container ${theme}-theme`}>
                    <Col xs={24} md={12}>
                        <Timeline mode="alternate" className={`timeline-box ${theme}-theme`}>
                            {timeline}
                        </Timeline>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form ref={formRef} onFinish={onFinish} className={`form-box ${theme}-theme`}>
                            <Form.Item
                                name="name"
                                rules={[
                                    { required: true, message: "Please input the task name!" },
                                ]}
                            >
                                <Input
                                    placeholder="Task Name"
                                    className="form-input"
                                    maxLength={50}
                                />
                            </Form.Item>
                            {/* Add the class and style for the date pickers */}
                            <div className="date-pickers">
                                <Form.Item
                                    name="start_on"
                                    rules={[
                                        { required: false, message: "Please input the date and time you want to start" },
                                    ]}
                                >
                                    <ReactDatePicker
                                        selected={startOn}
                                        onChange={handleStartOnChange}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className={`date-picker ${theme}-theme`}
                                        placeholderText="Start"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="deadline_on"
                                    rules={[
                                        { required: false, message: "Please input the date and time you want to finish by it" },
                                    ]}
                                >
                                    <ReactDatePicker
                                        selected={deadlineOn}
                                        onChange={handleDeadlineOnChange}
                                        showTimeSelect
                                        dateFormat="Pp"
                                        className={`date-picker ${theme}-theme`}
                                        placeholderText="Deadline"
                                        maxLength={10}
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item>
                                <button type="submit" className={`add-task-btn ${theme}-theme`}>
                                    Add Task
                                </button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default App;

