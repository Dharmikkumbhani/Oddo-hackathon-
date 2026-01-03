import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getProfile, updateProfile } from '../services/profileService';
import { getCurrentUser } from '../services/authService';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('resume'); // resume, private, salary
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = getCurrentUser();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile('me');
            // Ensure arrays are initialized if null
            if (!data.skills) data.skills = [];
            if (!data.certifications) data.certifications = [];
            if (!data.interests) data.interests = [];
            if (!data.salaryDetails) data.salaryDetails = {};
            setProfile(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch profile', error);
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setProfile({ ...profile, [field]: value });
    };

    const handleDeepChange = (parent, field, value) => {
        setProfile({
            ...profile,
            [parent]: {
                ...profile[parent],
                [field]: value
            }
        });
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...profile[field]];
        newArray[index] = value;
        setProfile({ ...profile, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setProfile({ ...profile, [field]: [...profile[field], ""] });
    };

    const removeArrayItem = (field, index) => {
        const newArray = [...profile[field]];
        newArray.splice(index, 1);
        setProfile({ ...profile, [field]: newArray });
    };

    const saveProfile = async () => {
        try {
            await updateProfile('me', profile);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

    const isAdmin = currentUser?.role === 'Admin';
    const showSalaryTab = isAdmin; // Only admin sees the salary tab as per requirement

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <Navbar />

            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-white border rounded-lg shadow-sm mb-6">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold italic">My Profile</h2>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline">Edit</button>
                        ) : (
                            <div className="space-x-2">
                                <button onClick={saveProfile} className="text-green-600 hover:underline font-bold">Save</button>
                                <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="text-red-500 hover:underline">Cancel</button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center md:col-span-1">
                            <div className="w-32 h-32 rounded-full bg-pink-300 flex items-center justify-center relative mb-4">
                                <span className="text-4xl text-white">✏️</span>
                            </div>
                            <div className="w-full">
                                <input
                                    disabled={!isEditing}
                                    value={profile.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="text-2xl font-bold text-center w-full border-b border-transparent focus:border-gray-300 outline-none bg-transparent"
                                    placeholder="My Name"
                                />
                            </div>
                        </div>

                        {/* Basic Info Grid */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Login ID</span>
                                <span className="font-medium">{profile.employeeId || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Company</span>
                                <span className="font-medium">{profile.companyName || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Email</span>
                                <span className="font-medium">{profile.email || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Department</span>
                                <input
                                    disabled={!isEditing || !isAdmin}
                                    value={profile.department || ''}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing && isAdmin ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>

                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Mobile</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.phone || ''}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>
                            <div className="flex flex-col border-b pb-1">
                                <span className="text-gray-500 text-xs">Manager</span>
                                <input
                                    disabled={!isEditing || !isAdmin}
                                    value={profile.manager || ''}
                                    onChange={(e) => handleChange('manager', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing && isAdmin ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>

                            <div className="flex flex-col border-b pb-1">
                                {/* Placeholder for spacing if needed, or location */}
                                <span className="text-gray-500 text-xs">Location</span>
                                <input
                                    disabled={!isEditing}
                                    value={profile.location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className={`font-medium w-full bg-transparent outline-none ${isEditing ? 'border-b border-blue-200' : ''}`}
                                    placeholder="-"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-6 border-b">
                        <button
                            onClick={() => setActiveTab('resume')}
                            className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'resume' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Resume
                        </button>
                        <button
                            onClick={() => setActiveTab('private')}
                            className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'private' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Private Info
                        </button>
                        {showSalaryTab && (
                            <button
                                onClick={() => setActiveTab('salary')}
                                className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'salary' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Salary Info
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {activeTab === 'resume' && (
                        <>
                            {/* Left Column: About, Interests */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-white p-4 rounded-lg border shadow-sm h-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold italic">About</h3>
                                        <span className="text-gray-400">✏️</span>
                                    </div>
                                    <textarea
                                        disabled={!isEditing}
                                        value={profile.about || ''}
                                        onChange={(e) => handleChange('about', e.target.value)}
                                        className="w-full h-32 text-sm text-gray-600 resize-none outline-none border-none bg-transparent"
                                        placeholder="Lorem ipsum is simply dummy text of the printing and typesetting industry..."
                                    />

                                    <div className="mt-6">
                                        <h3 className="font-semibold italic mb-2">My interests and hobbies</h3>
                                        {/* Assuming Interests is also text for now based on image layout */}
                                        <textarea
                                            disabled={!isEditing}
                                            value={profile.interests || ''} // If it was array, we'd join it, but model has it JSONB, let's assume text for simple block or simple array join
                                            onChange={(e) => handleChange('interests', e.target.value)} // Simplifying to text block for this field as per image look
                                            className="w-full h-24 text-sm text-gray-600 resize-none outline-none border-none bg-transparent"
                                            placeholder="Lorem ipsum is simply dummy text..."
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-semibold italic mb-2">What I love about my job</h3>
                                        <p className="text-xs text-gray-400">Placeholder functionality...</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Skills, Certification */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="font-semibold border-b pb-2 mb-2">Skills</h3>
                                    <div className="space-y-2">
                                        {Array.isArray(profile.skills) && profile.skills.map((skill, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={skill}
                                                    onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                                                    className="border p-1 text-sm w-full rounded"
                                                />
                                                {isEditing && <button onClick={() => removeArrayItem('skills', index)} className="text-red-500">x</button>}
                                            </div>
                                        ))}
                                        {isEditing && <button onClick={() => addArrayItem('skills')} className="text-sm text-blue-500">+ Add Skills</button>}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border shadow-sm">
                                    <h3 className="font-semibold border-b pb-2 mb-2">Certification</h3>
                                    <div className="space-y-2">
                                        {/* Reusing text logic for certifications */}
                                        {Array.isArray(profile.certifications) && profile.certifications.map((cert, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={cert}
                                                    onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                                                    className="border p-1 text-sm w-full rounded"
                                                />
                                                {isEditing && <button onClick={() => removeArrayItem('certifications', index)} className="text-red-500">x</button>}
                                            </div>
                                        ))}
                                        {isEditing && <button onClick={() => addArrayItem('certifications')} className="text-sm text-blue-500">+ Add Certification</button>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'private' && (
                        <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Private Information</h3>
                            <p className="text-gray-500">Bank account details, home address, etc. (Not implemented in this demo)</p>
                        </div>
                    )}

                    {activeTab === 'salary' && showSalaryTab && (
                        <div className="md:col-span-3 bg-white p-6 rounded-lg border shadow-sm">
                            <div className="text-center mb-6 border border-gray-300 inline-block px-4 py-1 rounded shadow-sm bg-gray-50 mx-auto block w-fit">
                                <h3 className="text-lg font-semibold">Salary Info</h3>
                            </div>

                            {/* Wage Info */}
                            <div className="flex justify-between mb-8 border-b pb-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold w-24">Month Wage</span>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.salaryDetails?.monthlyWage || ''}
                                            onChange={(e) => handleDeepChange('salaryDetails', 'monthlyWage', e.target.value)}
                                            className="border-b border-gray-300 text-right w-32 font-mono outline-none"
                                        />
                                        <span className="text-gray-500">/ Month</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold w-24">Yearly Wage</span>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.salaryDetails?.yearlyWage || ''}
                                            onChange={(e) => handleDeepChange('salaryDetails', 'yearlyWage', e.target.value)}
                                            className="border-b border-gray-300 text-right w-32 font-mono outline-none"
                                        />
                                        <span className="text-gray-500">/ Yearly</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm">No of working days in a week:</span>
                                        <input disabled className="border-b w-12 text-center" value="5" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm">Break Time:</span>
                                        <input disabled className="border-b w-12 text-center" value="1 hr" />
                                    </div>
                                </div>
                            </div>

                            {/* Components */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left: Salary Components */}
                                <div>
                                    <h4 className="font-semibold mb-4 underline">Salary Components</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Basic Salary</span>
                                            <div className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={profile.salaryDetails?.basicSalary || ''}
                                                    onChange={(e) => handleDeepChange('salaryDetails', 'basicSalary', e.target.value)}
                                                    className="border-b w-24 text-right"
                                                />
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">House Rent Allowance</span>
                                            <div className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={profile.salaryDetails?.hra || ''}
                                                    onChange={(e) => handleDeepChange('salaryDetails', 'hra', e.target.value)}
                                                    className="border-b w-24 text-right"
                                                />
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Standard Allowance</span>
                                            <div className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={profile.salaryDetails?.standardAllowance || ''}
                                                    onChange={(e) => handleDeepChange('salaryDetails', 'standardAllowance', e.target.value)}
                                                    className="border-b w-24 text-right"
                                                />
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Performance Bonus</span>
                                            <div className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={profile.salaryDetails?.performanceBonus || ''}
                                                    onChange={(e) => handleDeepChange('salaryDetails', 'performanceBonus', e.target.value)}
                                                    className="border-b w-24 text-right"
                                                />
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: PF & Tax */}
                                <div>
                                    <h4 className="font-semibold mb-4 underline">Provident Fund (PF) Contribution</h4>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Employee</span>
                                            <div className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={profile.salaryDetails?.pfEmployee || ''}
                                                    onChange={(e) => handleDeepChange('salaryDetails', 'pfEmployee', e.target.value)}
                                                    className="border-b w-24 text-right"
                                                />
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Employer's</span>
                                            <div className="flex gap-2">
                                                <input
                                                    disabled={!isEditing}
                                                    value={profile.salaryDetails?.pfEmployer || ''}
                                                    onChange={(e) => handleDeepChange('salaryDetails', 'pfEmployer', e.target.value)}
                                                    className="border-b w-24 text-right"
                                                />
                                                <span className="text-xs text-gray-500">/ month</span>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="font-semibold mb-4 underline">Tax Deductions</h4>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Professional Tax</span>
                                        <div className="flex gap-2">
                                            <input
                                                disabled={!isEditing}
                                                value={profile.salaryDetails?.professionalTax || ''}
                                                onChange={(e) => handleDeepChange('salaryDetails', 'professionalTax', e.target.value)}
                                                className="border-b w-24 text-right"
                                            />
                                            <span className="text-xs text-gray-500">/ month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
