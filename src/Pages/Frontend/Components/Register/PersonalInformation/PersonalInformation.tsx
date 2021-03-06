import React, { FC, useState } from 'react'
import { DeepMap, FieldError, FieldValues, UseFormRegister } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { UPLOADED_FILES } from '../../../../../Constants/FileConstants'
import { useReference } from '../../../../../Hooks'
import fileService from '../../../../../Services/fileService'
import userService from '../../../../../Services/userService'
import emptyAvarter from "./../../../../../Assets/images/user-empty-avatar.png";
import country from './../../../../../Data/country.json'
import "./PersonalInformation.scss"
import MD5 from 'crypto-js/md5'
import { AgeValidator } from '../../../../../Helpers'

interface personalType {
  changeTab:(value: number) => void;
  register:UseFormRegister<FieldValues>;
  value:any;
  watch:any;
  errors:DeepMap<FieldValues, FieldError>;
  handleChange:(e: any) => void;
}

const initialData = { fileType: "", name: "", remoteURL: "", size: "" }

const PersonalInformation:FC<personalType> = (props) => {
  // eslint-disable-next-line no-unused-vars
  const {
    surname,
    jobRole,
    firstname,
    middlename,
    dataOfBirth,
    phoneNo,
    phoneNo2,
    email,
    email2,
    gender,
    medicalConditionStatus,
    medicalCondition,
    fatherName,
    fatherBirthPlace,
    motherName,
    motherBirthPlace,
    maritalStatus,
    nationality,
    maidenName,
    nextOfKin,
    relationshipWithNextOfKin,
    placeOfBirth,
  } = props.value

  const dispatcher = useDispatch()
  const userNin = useReference()
  const { uploadedFiles } = useSelector((state:any) => state)
  const [uploadStatus, setUploadStatus] = useState(false)

  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState<any[]>([])

  let disable = true

  const [uploaded, setUploaded] = useState<any>(initialData)
  const storedFiles: string[] = uploadedFiles

  function checkExistence (type:string) {
    return uploadedFiles.filter(function (element: { fileType: string }) {
      return element.fileType === type;
    }).length
  }
  let dobLimitError = false
  const bday = AgeValidator(dataOfBirth)
  if (bday <= 17) {
    dobLimitError = true
  }

  // simple validation
  if (error.length === 0 &&
    checkExistence("profilePhoto") !== 0 &&
    surname !== "" &&
    jobRole !== "" &&
    firstname !== "" &&
    dataOfBirth !== "" &&
    AgeValidator(dataOfBirth) < 18 &&
    phoneNo !== "" &&
    email !== "" &&
    gender !== "" &&
    medicalConditionStatus !== "" &&
    fatherName !== "" &&
    fatherBirthPlace !== "" &&
    motherName !== "" &&
    motherBirthPlace !== "" &&
    maritalStatus !== "" &&
    nationality !== "" &&
    maidenName !== "" &&
    nextOfKin !== "" &&
    relationshipWithNextOfKin !== "" &&
    placeOfBirth !== "") {
    disable = false
  }

  const hashRef:any = MD5(userNin.id).toString();

  const uploadImage = async (event: { target: { files: any; }; }) => {
    const file = event.target.files
    const fileType = "profilePhoto"
    setUploadStatus(true)
    await fileService.uploadImage(file, fileType, hashRef).then((res:any) => {
      const resData = {
        remoteURL: res,
        name: file[0].name,
        size: (file[0].size / 1048576).toFixed(2),
        fileType
      }
      setUploaded(resData)
      dispatcher({ type: UPLOADED_FILES, data: [...storedFiles, resData] })
      setUploadStatus(false)
    }, error => {
      console.log(error.message)
    })
  }

  const deletFile = async (data:string) => {
    alert(data)
    await fileService.deleteFile(data).then((res) => {
      return res
    }, error => {
      console.log(error.message)
    })
  }

  const copyFunction = () => {
    const copyref:any = document.getElementById("myInput");
    copyref.select();
    copyref.setSelectionRange(0, 99999);
    document.execCommand("copy");
    alert("Copied the reference id " + copyref.value);
  }

  /**
   * Basic Email validation
   *
   * */

  function checkError (type:string) {
    return error.find(x => x.type === type);
  }

  async function validatePhoneNo (e: { target: { value: any } }) {
    const phoneNos = e.target.value
    console.log("PHONE VALIDATION +++++", email)
    await userService.validatePhone(phoneNos).then((res:{docs:any}) => {
      if (res.docs.length > 0) {
        setError([...error, { type: "phoneNo", message: "Phone number already exist" }])
        disable = true
      } else {
        error.splice(error.findIndex(a => a.type === 'phoneNo'), 1)
        setError(error)
      }
    })
  }

  async function validatePhoneNo2 (e: { target: { value: any } }) {
    const phoneNos2 = e.target.value
    if (phoneNos2 !== "") {
      await userService.validatePhone(phoneNos2).then((res:{docs:any}) => {
        if (res.docs.length > 0) {
          setError([...error, { type: "phoneNo2", message: "Phone number already exist" }])
          disable = true
        } else {
          error.splice(error.findIndex(a => a.type === 'phoneNo2'), 1)
          setError(error)
        }
      })
    }
  }

  async function validateEmail (e: { target: { value: any } }) {
    const emails = e.target.value
    await userService.validateEmail(emails).then((res:any) => {
      if (res.docs.length > 0) {
        setError([...error, { type: "email", message: "Email already exist" }])
        disable = true
      } else {
        error.splice(error.findIndex(a => a.type === 'email'), 1)
        setError(error)
      }
    })
  }

  async function validateEmail2 (e: { target: {value: any } }) {
    const emails2 = e.target.value
    if (emails2 !== "") {
      await userService.validateEmail(emails2).then((res:any) => {
        if (res.docs.length > 0) {
          setError([...error, { type: "email2", message: "Email already exist" }])
          disable = true
        } else {
          error.splice(error.findIndex(a => a.type === 'email2'), 1)
          setError(error)
        }
      })
    }
  }
  return (
    // personalInfo markup
    <React.Fragment>
      <div className="personalInfo">
        {/* personalInfo title */}
        <div className="personalInfo__titlebar">

        <div className="stepwizard mb-5">
          <div className="stepwizard-row setup-panel">
              <div className="stepwizard-step">
                  <a href="#step-1" type="button" className="btn btn-primary btn-circle">1</a>
                  <p>Step 1</p>
              </div>
              <div className="stepwizard-step">
                  <a href="#step-2" type="button" className="btn btn-default btn-circle">2</a>
                  <p>Step 2</p>
              </div>
              <div className="stepwizard-step">
                  <a href="#step-3" type="button" className="btn btn-default btn-circle">3</a>
                  <p>Step 3</p>
              </div>
              <div className="stepwizard-step">
                  <a href="#step-3" type="button" className="btn btn-default btn-circle">4</a>
                  <p>Step 4</p>
              </div>
              <div className="stepwizard-step">
                  <a href="#step-3" type="button" className="btn btn-default btn-circle">5</a>
                  <p>Step 5</p>
              </div>
          </div>
        </div>
        < h4 className="personalInfo__subtitle">Step 1 : Personal Information</h4>
        </div>

        {/* form - file field - open */}
        <div className="personalInfo__fileField">
          <div className="personalInfo__uploadFile">
            {uploaded.remoteURL && <div className="d-block">
                <small className="mb-5"> photo in png or jpeg formart</small><br></br>
              <img src={uploaded.remoteURL || emptyAvarter} alt="" className="w-50"/>
            </div>}
            <br/>

            {uploaded && emptyAvarter &&
              (uploaded?.fileType === "profilePhoto" && (
                    <span className="fa fa-check fa-1x rounded-circle p-2 bg-success text-right text-white shadow-sm" onChange={() => deletFile(`${uploaded.fileType} /${uploaded.name}`)}></span>
              ))
            }
              {uploadStatus && (
                <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="sr-only">Loading...</span>
                </div>
              )}

            <label htmlFor="profilePhoto mt-1">
                <input type="file" onChange={uploadImage} name="passport" id="passport" required></input>
            </label>
          </div>

          <p className="personalInfo__labelContainer text-center mt-3">
            <label htmlFor="upload passport">Upload Passport Photograph <span className="text-danger">*</span></label>
          </p>
        </div>
        {/* form - file field - close */}

        {/* form - text fields - open */}
        <div className="personalInfo__textFields row pl-4">
          <div className="form-group col-xl-12 text-center">
            <div className="text-center w-100 font-weight-bold">Your Reference ID</div>
            <input type="text" onClick={copyFunction} value={userNin.id} readOnly className="w-50 offset-3 text-success text-center form-control" id="myInput" title="Click to copy" style={{ fontSize: "1.8rem", fontWeight: "bold" }}/>
          </div>
        <div className="form-group col-xl-6">
              <label htmlFor="state of origin" className="">
                Job Role <span className="text-danger">*</span>
              </label>
              <br />
              <select
                className="form-control"
                id="stateOfOrigin"
                {...props.register("jobRole", {
                  required: 'this is a required field',
                  pattern: {
                    value:
                     /^[a-zA-Z]*$/,
                    message: 'Invalid input',
                  }
                })} onChange={props.handleChange}
              >
              <option value="null">Select a Job Role</option>
            <optgroup label="Permanent">
              <option>Consultant</option>
              <option>Registrar</option>
              <option>Medical Officer</option>
              <option>Dental Officer</option>
              <option>Med.Lab Scientist</option>
              <option>Pharmacist</option>
              <option>Pharmacy Technician</option>
              <option>Nursing Officer</option>
              <option>Dietrician/Nutritionist</option>
              <option>Physioterapist</option>
              <option>Radiographer</option>
              <option>Optometrist</option>
              <option>Hospital Administrator</option>
              <option>Medical Record Officer</option>
              <option>Medical Laboratory Technician</option>
              <option>Dental Technician</option>
              <option>X-RAY Technician</option>
              <option>Dental Therapist</option>
              <option>Dental Technologist</option>
            </optgroup>
            <optgroup label="Intern">
              <option value="pharmacy">Pharmacy</option>
              <option value="nurse">Nurse</option>
              <option value="MedHO">Medical House Officer</option>
              <option value="dentalHO">Dental House Officer</option>
              <option value="physiology">Physiotherapy</option>
              <option value="medlab">Med lab</option>
              <option value="radiology">Radiology</option>
            </optgroup>
            </select>
              <div className="register--error text-danger">
                  {props.errors.jobRole && props.errors.jobRole.message}
              </div>
          </div>

          <div className="form-group col-xl-6">
              <label htmlFor="surname">
                Surname <span className="text-danger">*</span>
              </label>
              <br />
              <input
                className="form-control"
                type="text"
                id="surname"
                placeholder="Gakumba"
                {...props.register("surname", {
                  required: 'this is a required field',
                  pattern: {
                    value:
                     /^[a-zA-Z]*$/,
                    message: 'Invalid input',
                  }
                })} value={surname} onChange={props.handleChange}
              />
              <div className="register--error text-danger">
                  {props.errors.surname && props.errors.surname.message}
              </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="firstname">
              First Name <span className="text-danger">*</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="firstname"
              placeholder="Leonard"
              {...props.register("firstname", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={firstname}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
                {props.errors.firstname && props.errors.firstname.message}
            </div>
          </div>

            <div className="form-group col-xl-6">
              <label htmlFor="middlename" className="personalInfo__label">
                Middle Name
              </label>
              <br />
              <input
                className="form-control"
                type="text"
                id="middlename"
                placeholder="Farruko"
              {...props.register("middlename", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={middlename} onChange={props.handleChange}
              />
              <div className="register--error text-danger">
                  {props.errors.middlename && props.errors.middlename.message}
              </div>
            </div>

            <div className="form-group col-xl-6">
              <label htmlFor="middlename" className="personalInfo__label">
                Date of birth <span className="text-danger">*</span>
              </label>
              <br />
              <input
                className="form-control"
                type="date"
                id="dateofbirth"
                data-date-inline-picker="true"
                placeholder="Farruko"
              {...props.register("dataOfBirth", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={dataOfBirth}
               onChange={props.handleChange}
              />
              <div className="register--error text-danger">
                  {props.errors.dataOfBirth && props.errors.dataOfBirth.message}
                  {dobLimitError && 'Age cannot be less than 18yrs'}

              </div>
            </div>

            <div className="form-group col-xl-6">
            <label htmlFor="phone" className="personalInfo__label">
              Phone Number 1 <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="number"
              id="phoneNo"
              placeholder="(234) 091 234 5678"
              {...props.register("phoneNo", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[0-9]*$/,
                  message: 'Invalid input',
                }
              })} value={phoneNo}
              onKeyUp={(e:any) => validatePhoneNo(e)}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
                {props.errors.phoneNo && props.errors.phoneNo.message}
                {checkError("phoneNo") && checkError("phoneNo").message}
            </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="phone" className="personalInfo__label">
              Phone Number 2
            </label>
            <br />
            <input
              className="form-control"
              type="number"
              id="phoneNo2"
              placeholder="(234) 091 234 5678"
              {...props.register("phoneNo2", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[0-9]*$/,
                  message: 'Invalid input',
                }
              })} value={phoneNo2}
              onKeyUp={(e:any) => validatePhoneNo2(e)}
               onChange={props.handleChange}
            />
             <div className="register--error text-danger">
                {props.errors.phoneNo2 && props.errors.phoneNo2.message}
                {checkError("phoneNo2") && checkError("phoneNo2").message}
            </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="email" className="personalInfo__label">
              Email Address 1 <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="email"
              placeholder="leongakumba@hotmail.com"
              {...props.register("email", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={email}
              onKeyUp={(e:{target:any}) => validateEmail(e)}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.email && props.errors.email.message}
                {checkError("email") && checkError("email").message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="email" className="personalInfo__label">
              Email Address 2
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="email"
              placeholder="leongakumba@hotmail.com"
              {...props.register("email2", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={email2}
              onKeyUp={(e:{target:any}) => validateEmail2(e)}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.email2 && props.errors.email2.message}
                {checkError("email2") && checkError("email2").message}
           </div>
          </div>

          <div className="form-group  col-xl-6">
            <label htmlFor="gender" className="personalInfo__label">
              Gender <span className="text-danger">*</span>
            </label>
            <br />
            <select
              className="form-control"
              id="gender"
              {...props.register("gender", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })}
              onChange={props.handleChange}
            >
              <option value="null">--choose--</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="register--error text-danger">
               {props.errors.gender && props.errors.gender.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="medicalConditionStatus" className="personalInfo__label">
            Any Medical Condition  <span className="text-danger">*</span>
            </label>
            <br />
            <select
              className="form-control"
              id="medicalConditionStatus"
              {...props.register("medicalConditionStatus", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })}
              value={medicalConditionStatus}
              onChange={props.handleChange}
            >
              <option value="null">--choose--</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
            <div className="register--error text-danger">
               {props.errors.medicalConditionStatus && props.errors.medicalConditionStatus.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="medicalCondition" className="personalInfo__label">
           If yes state medical condition
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="medicalCondition"
              {...props.register("medicalCondition", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={medicalCondition}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.medicalCondition && props.errors.medicalCondition.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="fatherName" className="personalInfo__label">
             Father name <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="fatherName"
              placeholder="John doe"
              {...props.register("fatherName", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={fatherName}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.fatherName && props.errors.fatherName.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="fatherBirthPlace" className="personalInfo__label">
            Father&lsquo;s birth place <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="fatherBirthPlace"
              {...props.register("fatherBirthPlace", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={fatherBirthPlace}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.fatherBirthPlace && props.errors.fatherBirthPlace.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="motherName" className="personalInfo__label">
            Mother&lsquo;s name <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="motherName"
              {...props.register("motherName", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={motherName}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.motherName && props.errors.motherName.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="motherBirthPlace" className="personalInfo__label">
            Mother birth place <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="motherBirthPlace"
              {...props.register("motherBirthPlace", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={motherBirthPlace}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.motherBirthPlace && props.errors.motherBirthPlace.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="maritalStatus" className="personalInfo__label">
            Marital status <span className="text-danger">*</span>
            </label>
            <br />
            <select
              className="form-control"
              id="maritalStatus"
              {...props.register("maritalStatus", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={maritalStatus}
               onChange={props.handleChange}
            >
                <option value="null">--choose--</option>
                <option>Single</option>
                <option>Married</option>
            </select>
            <div className="register--error text-danger">
               {props.errors.maritalStatus && props.errors.maritalStatus.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="nationality" className="personalInfo__label">
            Nationality <span className="text-danger">*</span>
            </label>
            <br />
            <select
              className="form-control"
              id="nationality"
              {...props.register("nationality", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={nationality}
               onChange={props.handleChange}
            >
              <option>--choose--</option>
              {
                country.map((countries:any, index) => {
                  return (<option key={index}>{countries.name}</option>)
                })
              }
              </select>
            <div className="register--error text-danger">
               {props.errors.nationality && props.errors.nationality.message}
            </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="maidenName" className="personalInfo__label">
            Maiden name<span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="maidenName"
              {...props.register("maidenName", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={maidenName}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.maidenName && props.errors.maidenName.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="nextOfKin" className="personalInfo__label">
            Full name of next of kin <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="nextOfKin"
              {...props.register("nextOfKin", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={nextOfKin}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.nextOfKin && props.errors.nextOfKin.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="relationshipWithNextOfKin" className="personalInfo__label">
            Relationship with next of kin <span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="relationshipWithNextOfKin"
              {...props.register("relationshipWithNextOfKin", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={relationshipWithNextOfKin}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.relationshipWithNextOfKin && props.errors.relationshipWithNextOfKin.message}
           </div>
          </div>

          <div className="form-group col-xl-6">
            <label htmlFor="placeOfBirth" className="personalInfo__label">
            Place of birth<span className="text-danger">*</span>
            </label>
            <br />
            <input
              className="form-control"
              type="text"
              id="placeOfBirth"
              {...props.register("placeOfBirth", {
                required: 'this is a required field',
                pattern: {
                  value:
                   /^[a-zA-Z]*$/,
                  message: 'Invalid input',
                }
              })} value={placeOfBirth}
               onChange={props.handleChange}
            />
            <div className="register--error text-danger">
               {props.errors.placeOfBirth && props.errors.placeOfBirth.message}
           </div>
          </div>

        </div>
      </div>
      {/* form - text fields - close */}

      {/* back and next buttons */}
      <div className="ctrls pl-4 mt-2">
        <div className="ctrls__next">
          <button type="button" className="ctrls__btn btn btn-dark" onClick={() => props.changeTab(2)} disabled={disable}>Next</button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default PersonalInformation
