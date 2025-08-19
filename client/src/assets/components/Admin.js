
import React, { useState } from 'react';
import './Admin-login.css';

const Admin = () => {
	// State for Add User form
	const [userForm, setUserForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		role: '',
		password: '',
		confirmPassword: '',
		photo: null,
	});
	// State for Add Course form
	const [courseForm, setCourseForm] = useState({
		title: '',
		category: '',
		description: '',
		xp: '',
		duration: '',
		image: null,
		instructor: '',
	});
	// Dummy instructors for select
	const instructors = [
		{ value: 'instructor1', label: 'Instructor 1' },
		{ value: 'instructor2', label: 'Instructor 2' },
	];

	// Handlers for Add User form
	const handleUserChange = (e) => {
		const { name, value, files } = e.target;
		setUserForm((prev) => ({
			...prev,
			[name]: files ? files[0] : value,
		}));
	};
	const handleUserSubmit = (e) => {
		e.preventDefault();
		// TODO: Add validation and API call
		alert('User added!');
	};

	// Handlers for Add Course form
	const handleCourseChange = (e) => {
		const { name, value, files } = e.target;
		setCourseForm((prev) => ({
			...prev,
			[name]: files ? files[0] : value,
		}));
	};
	const handleCourseSubmit = (e) => {
		e.preventDefault();
		// TODO: Add validation and API call
		alert('Course added!');
	};

	return (
		<div className="admin-forms-container" style={{ maxWidth: 700, margin: '40px auto' }}>
			<div className="admin-card mb-4">
				<h3 className="card-title mb-3">Add New User</h3>
				<form onSubmit={handleUserSubmit}>
					<div className="row">
						<div className="col-md-6">
							<div className="form-group">
								<label className="form-label">First Name</label>
								<input type="text" className="form-control" name="firstName" value={userForm.firstName} onChange={handleUserChange} required />
							</div>
						</div>
						<div className="col-md-6">
							<div className="form-group">
								<label className="form-label">Last Name</label>
								<input type="text" className="form-control" name="lastName" value={userForm.lastName} onChange={handleUserChange} required />
							</div>
						</div>
					</div>
					<div className="form-group">
						<label className="form-label">Email Address</label>
						<input type="email" className="form-control" name="email" value={userForm.email} onChange={handleUserChange} required />
					</div>
					<div className="form-group">
						<label className="form-label">Phone Number</label>
						<input type="tel" className="form-control" name="phone" value={userForm.phone} onChange={handleUserChange} />
					</div>
					<div className="form-group">
						<label className="form-label">Role</label>
						<select className="form-select" name="role" value={userForm.role} onChange={handleUserChange} required>
							<option value="">Select Role</option>
							<option value="student">Student</option>
							<option value="instructor">Instructor</option>
							<option value="admin">Administrator</option>
						</select>
					</div>
					<div className="form-group">
						<label className="form-label">Password</label>
						<input type="password" className="form-control" name="password" value={userForm.password} onChange={handleUserChange} required minLength={8} />
						<div className="form-text">Minimum 8 characters</div>
					</div>
					<div className="form-group">
						<label className="form-label">Confirm Password</label>
						<input type="password" className="form-control" name="confirmPassword" value={userForm.confirmPassword} onChange={handleUserChange} required />
					</div>
					<div className="form-group">
						<label className="form-label">Profile Photo</label>
						<input type="file" className="form-control" name="photo" onChange={handleUserChange} />
					</div>
					<div className="mt-3">
						<button className="btn btn-primary" type="submit">Add User</button>
					</div>
				</form>
			</div>

			<div className="admin-card">
				<h3 className="card-title mb-3">Add New Course</h3>
				<form onSubmit={handleCourseSubmit}>
					<div className="form-group">
						<label className="form-label">Course Title</label>
						<input type="text" className="form-control" name="title" value={courseForm.title} onChange={handleCourseChange} required />
					</div>
					<div className="form-group">
						<label className="form-label">Category</label>
						<select className="form-select" name="category" value={courseForm.category} onChange={handleCourseChange} required>
							<option value="">Select Category</option>
							<option value="digital-literacy">Digital Literacy</option>
							<option value="business">Business</option>
							<option value="networking">Networking</option>
							<option value="programming">Programming</option>
						</select>
					</div>
					<div className="form-group">
						<label className="form-label">Description</label>
						<textarea className="form-control" name="description" rows={4} value={courseForm.description} onChange={handleCourseChange} required />
					</div>
					<div className="row">
						<div className="col-md-6">
							<div className="form-group">
								<label className="form-label">XP Value</label>
								<input type="number" className="form-control" name="xp" value={courseForm.xp} onChange={handleCourseChange} required min={0} />
							</div>
						</div>
						<div className="col-md-6">
							<div className="form-group">
								<label className="form-label">Duration (weeks)</label>
								<input type="number" className="form-control" name="duration" value={courseForm.duration} onChange={handleCourseChange} required min={1} />
							</div>
						</div>
					</div>
					<div className="form-group">
						<label className="form-label">Course Image</label>
						<input type="file" className="form-control" name="image" accept="image/*" onChange={handleCourseChange} />
					</div>
					<div className="form-group">
						<label className="form-label">Instructor</label>
						<select className="form-select" name="instructor" value={courseForm.instructor} onChange={handleCourseChange} required>
							<option value="">Select Instructor</option>
							{instructors.map((inst) => (
								<option key={inst.value} value={inst.value}>{inst.label}</option>
							))}
						</select>
					</div>
					<div className="mt-3">
						<button className="btn btn-primary" type="submit">Add Course</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Admin;
