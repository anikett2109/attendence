import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, #007bff, #00c6ff);
`;

const FormWrapper = styled.div`
  width: 400px;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #0056b3;
  }
`;

const Message = styled.p`
  text-align: center;
  color: ${(props) => (props.success ? "green" : "red")};
`;

const Register = () => {
  const [formData, setFormData] = useState({ email: "", name: "", password: "", officeId: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", formData);
      setMessage(res.data.message);
      setFormData({ email: "", name: "", password: "", officeId: "" });
    } catch (error) {
      setMessage("Registration failed!");
    }
  };

  return (
    <div>
    <Container>
      <FormWrapper>
        <Title>Admin Registration</Title>
        <form onSubmit={handleSubmit}>
          <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <Input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <Input type="text" name="officeId" placeholder="Office ID" value={formData.officeId} onChange={handleChange} required />
          <Button type="submit">Register</Button>
        </form>
        {message && <Message success={message.includes("Successfully")}>{message}</Message>}
      </FormWrapper>
    </Container>
    </div>
  );
};

export default Register;
