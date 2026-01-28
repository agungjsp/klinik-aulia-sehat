# API documentation

URL Dev BackEnd: [**https://sistem-antrean.zeabur.app/**](https://sistem-antrean.zeabur.app/)

| Title | Sub Page | Details | Status |
| --- | --- | --- | --- |
| Auth | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-2636) | login, logout<br><br>register tidak termasuk, gunakan Seeder untuk generate user superadmin | DONE |
| N8N Integration | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3236) | Webhook | DONE |
| **M1 - Jadwal Dokter** |  |  |  |
| Schedule | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-2936) | select, detail, create, update, delete | DONE |
| **M7 - Master Data** |  |  |  |
| Users | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-2676) | select, detail, create, update, delete, trashed, restore | DONE |
| Roles | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-2896) | select, detail, create, update, delete, trashed, restore | DONE |
| Poly | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-2916) | select, detail, create, update, delete, trashed, restore | DONE |
| Status | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3156) | select, detail, create, update, delete, trashed, restore | DONE |
| Patients | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3316) | select, detail, update | DONE |
| **Reservation & Queue** |  |  |  |
| Reservation | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-2956) | select, detail, create, update | DONE |
| Queue | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3176) | update status:<br>anamnesa, waitingdoctor, withdoctor, done, noshow, cancelled;<br>queue<br>queue\_list, current\_queue, call\_next\_queue | DONE |
| Check-Up Schedule | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3416) | select, detail, create, update, delete | DONE |
| **Configuration** |  |  |  |
| Message Template | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3336) | select, detail, create, update, delete | DONE |
| Reminder Config | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3356) | select, detail, create, update, delete | DONE |
| Whatsapp Config | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3376) | select, detail, create, update, delete | DONE |
| Config | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3396) | select, detail, create, update, delete | DONE |
| Faq | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3436) | select, detail, create, update, delete | DONE |
| **Dashboard & Report** |  |  |  |
| Dashboard | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3496) | summary<br>total reservasi per poli<br>perbandingan reservasi per poli<br>tingkat kehadiran pasien<br>rata-rata waktu tunggu<br>jam sibuk klinik<br>rasio no-show | DONE |
| Report | [](https://app.clickup.com/31586709/v/dc/y3ycn-7156/y3ycn-3516) | laporan kunjungan pasien<br>laporan noshow & cancelled<br>laporan bpjs vs umum<br>laporan kinerja poli<br>laporan waktu tunggu<br>laporan jam sibuk<br>laporan aktivitas user | DONE |

## Authentication

### Login

#### Auth (Login)

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/auth/login |
| Method | POST |
| Header | Content-Type: application/json |
| Security | none |
| Request Body | {<br>'username' => 'username',<br>'password' => 'password'<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Login success",<br>"token": "5\|k0kvQnAOsnKj8K87cAX12Dnv87cVCT1PcLsII76G0f6f8e5e",<br>"type": "Bearer",<br>"user": {<br>"id": 1,<br>"name": "Super Admin",<br>"username": "superadmin",<br>"email": "[superadmin@mail.com](mailto:superadmin@mail.com)",<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum"<br>},<br>"roles": \[<br>{<br>"id": 1,<br>"name": "Super Admin"<br>}<br>\]<br>}<br>}<br>catatan:<br>poly bisa null<br>role bisa lebih dari 1<br><br>error ketika username/password kosong<br>{<br>"status": "error",<br>"message": "The password field is required.",<br>"errors": {<br>"password": \[<br>"The password field is required."<br>\]<br>}<br>}<br><br>error ketika username/password salah<br>{<br>    "status": "error",<br>    "message": "Incorrect username or password"<br>} |

| Nama | Tipe Data | Required | Keterangan |
| --- | --- | --- | --- |
| username | string | Ya |  |
| password | string | Ya |  |

### Logout

#### Auth (Logout)

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/auth/logout |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Logout success"<br>}<br><br>error logout gagal<br>{<br>"status": "error",<br>"message": "Unauthenticated"<br>} |

### Generate Permanent Token
Token ini digunakan untuk **n8n** agar bisa mengirim request ke BE

#### Auth (Logout)

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/auth/permanent-token |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Permanent token generated successfully",<br>"data": {<br>"token\_name": "permanent-token",<br>"token": "20\|CCQDc0cP5RDbgx3yOeAleNMNzjbXKyGdsgRlYqxw4d4c0a36"<br>}<br>}<br><br>error gagal<br>{<br>"status": "error",<br>"message": "Unauthenticated"<br>} |

## Master Data



## Users

### SELECT

#### User Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users |
|  | {Base\_URL}/api/users?search=admin&page=1&per\_page=10 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Params | search ex: ?search=admin<br>untuk mencari data by name, username, email<br>page ex: ?page=2<br>per\_page ex: ?per\_page=10<br>per\_page min=1, max=100 |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 1,<br>"name": "Super Admin",<br>"email": "[superadmin@mail.com](mailto:superadmin@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z",<br>"poly\_id": 1,<br>"username": "superadmin",<br>"deleted\_at": null,<br>"roles": \[<br>{<br>"id": 1,<br>"name": "Super Admin",<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z",<br>"deleted\_at": null,<br>"pivot": {<br>"user\_id": 1,<br>"role\_id": 1,<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z"<br>}<br>}<br>\],<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>},<br>{<br>.... data 2 ....<br>},<br>{<br>.... data 3, dst ....<br>}<br>\],<br>"meta": {<br>"current\_page": 1,<br>"last\_page": 1,<br>"per\_page": 10,<br>"total": 2<br>}<br>} |

### CREATE / STORE

#### User Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"name": "Harris A",<br>"username": "harris",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"password": "dokter123",<br>"password\_confirmation": "dokter123",<br>"roles": \[3\],<br>"poly\_id": 1<br>}<br><br>Role bisa lebih dari 1, contoh:<br>"roles": \[1, 3\] |
| Response | success<br>{<br>"status": "success",<br>"message": "User created successfully",<br>"data": {<br>"name": "Harris A",<br>"username": "harris",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"poly\_id": 1,<br>"updated\_at": "2025-12-13T13:52:21.000000Z",<br>"created\_at": "2025-12-13T13:52:21.000000Z",<br>"id": 2,<br>"roles": \[<br>{<br>"id": 3,<br>"name": "doctor",<br>"created\_at": "2025-12-13T13:49:27.000000Z",<br>"updated\_at": "2025-12-13T13:49:27.000000Z",<br>"deleted\_at": null,<br>"pivot": {<br>"user\_id": 2,<br>"role\_id": 3,<br>"created\_at": "2025-12-13T13:52:21.000000Z",<br>"updated\_at": "2025-12-13T13:52:21.000000Z"<br>}<br>}<br>\],<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error (username, email sudah ada, password&password\_confirm tidak sama, role tidak ditemukan)<br>{<br>"status": "error",<br>"message": "The username has already been taken.",<br>"errors": {<br>"username": \[<br>"The username has already been taken."<br>\],<br>"email": \[<br>"The email has already been taken."<br>\],<br>"password": \[<br>"The password field confirmation does not match."<br>\],<br>"roles.0": \[<br>"The selected roles.0 is invalid."<br>\]<br>}<br>} |

| Nama | Tipe Data | Validation | Required | Keterangan |
| --- | --- | --- | --- | --- |
| name | string |  | Ya |  |
| username | string |  | Ya |  |
| email | string | email | Ya |  |
| password | string | min 6 | Ya |  |
| password\_confirmation | string | min 6 | Ya |  |
| roles | integer | array | Ya | id role, ex: \[1, 3\] |
| poly\_id | integer |  | Tidak |  |

### UPDATE

#### User Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"name": "Harris A",<br>"username": "harris",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"password": "dokter123",<br>"password\_confirmation": "dokter123",<br>"roles": \[3\],<br>"poly\_id": 1<br>}<br><br>Role bisa lebih dari 1, contoh:<br>"roles": \[1, 3\] |
| Response | success<br>{<br>"status": "success",<br>"message": "User updated successfully",<br>"data": {<br>"id": 2,<br>"name": "Harris Arista",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T13:52:21.000000Z",<br>"updated\_at": "2025-12-13T14:07:19.000000Z",<br>"poly\_id": null,<br>"username": "harris",<br>"deleted\_at": null,<br>"roles": \[<br>{<br>"id": 1,<br>"name": "Super Admin",<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z",<br>"deleted\_at": null,<br>"pivot": {<br>"user\_id": 2,<br>"role\_id": 1,<br>"created\_at": "2025-12-13T14:06:57.000000Z",<br>"updated\_at": "2025-12-13T14:06:57.000000Z"<br>}<br>}<br>\],<br>"poly": null<br>}<br>}<br><br>error (username, email sudah ada, password&password\_confirm tidak sama, role tidak ditemukan)<br>{<br>"status": "error",<br>"message": "The username has already been taken.",<br>"errors": {<br>"username": \[<br>"The username has already been taken."<br>\],<br>"email": \[<br>"The email has already been taken."<br>\],<br>"password": \[<br>"The password field confirmation does not match."<br>\],<br>"roles.0": \[<br>"The selected roles.0 is invalid."<br>\]<br>}<br>} |

| Nama | Tipe Data | Validation | Required | Keterangan |
| --- | --- | --- | --- | --- |
| name | string |  | Ya |  |
| username | string |  | Ya |  |
| email | string | email | Ya |  |
| password | string | min 6 | Tidak | jika kosong password tidak akan diupdate |
| password\_confirmation | string | min 6 | Tidak | jika kosong password tidak akan diupdate |
| roles | integer | array | Ya | id role, ex: \[1, 3\] |
| poly\_id | integer |  | Tidak |  |

### DETAIL

#### User Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": {<br>"id": 2,<br>"name": "Harris Arista",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T13:52:21.000000Z",<br>"updated\_at": "2025-12-13T14:09:44.000000Z",<br>"poly\_id": 1,<br>"username": "harris",<br>"deleted\_at": null,<br>"roles": \[<br>{<br>"id": 3,<br>"name": "doctor",<br>"created\_at": "2025-12-13T13:49:27.000000Z",<br>"updated\_at": "2025-12-13T13:49:27.000000Z",<br>"deleted\_at": null,<br>"pivot": {<br>"user\_id": 2,<br>"role\_id": 3,<br>"created\_at": "2025-12-13T14:09:45.000000Z",<br>"updated\_at": "2025-12-13T14:09:45.000000Z"<br>}<br>}<br>\],<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "User not found"<br>} |
|  |  |

### DELETE / DESTROY

#### User Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "User deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "User not found"<br>} |

### TRASHED

#### User Trashed

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users/trashed |
|  | {Base\_URL}/api/users/trashed?search=admin&page=1&per\_page=10 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Params | search ex: ?search=admin<br>untuk mencari data by name, username, email<br>page ex: ?page=2<br>per\_page ex: ?per\_page=10<br>per\_page min=1, max=100 |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 1,<br>"name": "Super Admin",<br>"email": "[superadmin@mail.com](mailto:superadmin@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z",<br>"poly\_id": 1,<br>"username": "superadmin",<br>"deleted\_at": "2025-12-13T14:34:43.000000Z",<br>"roles": \[<br>{<br>"id": 1,<br>"name": "Super Admin",<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z",<br>"deleted\_at": null,<br>"pivot": {<br>"user\_id": 1,<br>"role\_id": 1,<br>"created\_at": "2025-12-13T13:06:58.000000Z",<br>"updated\_at": "2025-12-13T13:06:58.000000Z"<br>}<br>}<br>\],<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>},<br>{<br>.... data 2 ....<br>},<br>{<br>.... data 3, dst ....<br>}<br>\],<br>"meta": {<br>"current\_page": 1,<br>"last\_page": 1,<br>"per\_page": 10,<br>"total": 2<br>}<br>} |

### RESTORE

#### User Restore

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/users/{id}/restore |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "User restored successfully",<br>"data": {<br>"id": 3,<br>"name": "Harris A",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T14:34:06.000000Z",<br>"updated\_at": "2025-12-13T14:38:51.000000Z",<br>"poly\_id": 1,<br>"username": "harris",<br>"deleted\_at": null,<br>"roles": \[<br>{<br>"id": 3,<br>"name": "doctor",<br>"created\_at": "2025-12-13T13:49:27.000000Z",<br>"updated\_at": "2025-12-13T13:49:27.000000Z",<br>"deleted\_at": null,<br>"pivot": {<br>"user\_id": 3,<br>"role\_id": 3,<br>"created\_at": "2025-12-13T14:34:06.000000Z",<br>"updated\_at": "2025-12-13T14:34:06.000000Z"<br>}<br>}<br>\],<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "User not found or not deleted"<br>} |

## Roles

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles |
|  | {Base\_URL}/api/roles?search=admin |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 1,<br>"name": "administrator",<br>"created\_at": "2025-12-13T11:44:46.000000Z",<br>"updated\_at": "2025-12-13T12:01:31.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 2,<br>"name": "dokter",<br>"created\_at": "2025-12-13T12:01:21.000000Z",<br>"updated\_at": "2025-12-13T12:01:21.000000Z",<br>"deleted\_at": null<br>}<br>\]<br>}<br> |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>'name' => 'administrator'<br>}<br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Role created successfully",<br>"data": {<br>"name": "administrator",<br>"updated\_at": "2025-12-13T11:44:46.000000Z",<br>"created\_at": "2025-12-13T11:44:46.000000Z",<br>"id": 1<br>}<br>}<br><br>error role sudah ada<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>} |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>'name' => 'administrator'<br>}<br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Role updated successfully",<br>"data": {<br>"id": 1,<br>"name": "administrator",<br>"created\_at": "2025-12-13T11:44:46.000000Z",<br>"updated\_at": "2025-12-13T12:00:45.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "Role not found"<br>}<br><br>error role sudah ada<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>}<br> |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": {<br>"id": 1,<br>"name": "administrator",<br>"created\_at": "2025-12-13T11:44:46.000000Z",<br>"updated\_at": "2025-12-13T12:01:31.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>    "status": "error",<br>    "message": "Role not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Role deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>    "status": "error",<br>    "message": "Role not found"<br>} |

### TRASHED
list role yang dihapus (softdelete)

#### Roles Trashed

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles/trashed |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 2,<br>"name": "dokter",<br>"created\_at": "2025-12-13T12:01:21.000000Z",<br>"updated\_at": "2025-12-13T12:42:36.000000Z",<br>"deleted\_at": "2025-12-13T12:42:36.000000Z"<br>}<br>\]<br>} |

### RESTORE

#### Roles Restore

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/roles/{id}/restore |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Role restored successfully",<br>"data": {<br>"id": 2,<br>"name": "dokter",<br>"created\_at": "2025-12-13T12:01:21.000000Z",<br>"updated\_at": "2025-12-13T12:36:49.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Role not found or not deleted"<br>} |

## Poly

### SELECT

#### Poly Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly |
|  | {Base\_URL}/api/poly?search=umum |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 2,<br>"name": "gigi",<br>"created\_at": "2025-12-13T12:29:53.000000Z",<br>"updated\_at": "2025-12-13T12:29:53.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 1,<br>"name": "umum",<br>"created\_at": "2025-12-13T12:28:59.000000Z",<br>"updated\_at": "2025-12-13T12:28:59.000000Z",<br>"deleted\_at": null<br>}<br>\]<br>} |

### CREATE / STORE

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"name": "umum"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Poly created successfully",<br>"data": {<br>"name": "umum",<br>"updated\_at": "2025-12-13T12:28:59.000000Z",<br>"created\_at": "2025-12-13T12:28:59.000000Z",<br>"id": 1<br>}<br>}<br><br>error poly sudah ada<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>} |

### UPDATE

#### Poly Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>'name' => 'umum'<br>}<br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Poly updated successfully",<br>"data": {<br>"id": 1,<br>"name": "umum",<br>"created\_at": "2025-12-13T12:28:59.000000Z",<br>"updated\_at": "2025-12-13T12:28:59.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "Poly not found"<br>}<br><br>error poly sudah ada<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>} |

### DETAIL

#### Poly Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": {<br>"id": 1,<br>"name": "umum",<br>"created\_at": "2025-12-13T12:28:59.000000Z",<br>"updated\_at": "2025-12-13T12:28:59.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>    "status": "error",<br>    "message": "Poly not found"<br>} |

### DELETE / DESTROY

#### Poly Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Poly deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Poly not found"<br>} |

### TRASHED
list poly yang dihapus (softdelete)

#### Poly Trashed

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly/trashed |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 2,<br>"name": "gigi",<br>"created\_at": "2025-12-13T12:29:53.000000Z",<br>"updated\_at": "2025-12-13T12:46:37.000000Z",<br>"deleted\_at": "2025-12-13T12:46:37.000000Z"<br>}<br>\]<br>} |

### RESTORE

#### Poly Restore

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/poly/{id}/restore |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Poly restored successfully",<br>"data": {<br>"id": 2,<br>"name": "gigi",<br>"created\_at": "2025-12-13T12:29:53.000000Z",<br>"updated\_at": "2025-12-13T12:50:42.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Poly not found or not deleted"<br>} |

## Status

### SELECT

#### Poly Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status |
|  | {Base\_URL}/api/status?search=waiting |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 1,<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar",<br>"created\_at": "2025-12-25T06:33:25.000000Z",<br>"updated\_at": "2025-12-25T06:33:25.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 2,<br>"status\_name": "WAITING",<br>"label": "Menunggu",<br>"information": "Menunggu dipanggil anamnesa",<br>"created\_at": "2025-12-25T06:34:58.000000Z",<br>"updated\_at": "2025-12-25T06:34:58.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 3,<br>"status\_name": "ANAMNESA",<br>"label": "Anamnesa",<br>"information": "Sedang pemeriksaan oleh perawat",<br>"created\_at": "2025-12-25T06:35:34.000000Z",<br>"updated\_at": "2025-12-25T06:35:34.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 4,<br>"status\_name": "WITH\_DOCTOR",<br>"label": "Dengan Dokter",<br>"information": "Sedang konsultasi dengan dokter",<br>"created\_at": "2025-12-25T06:36:04.000000Z",<br>"updated\_at": "2025-12-25T06:36:04.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 5,<br>"status\_name": "DONE",<br>"label": "Selesai",<br>"information": "Selesai, bisa ambil obat/pulang",<br>"created\_at": "2025-12-25T06:36:35.000000Z",<br>"updated\_at": "2025-12-25T06:36:35.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 6,<br>"status\_name": "NO\_SHOW",<br>"label": "Tidak Hadir",<br>"information": "Tidak datang saat dipanggil",<br>"created\_at": "2025-12-25T06:36:56.000000Z",<br>"updated\_at": "2025-12-25T06:36:56.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 7,<br>"status\_name": "CANCELLED",<br>"label": "Dibatalkan",<br>"information": "Batal oleh pasien atau admin",<br>"created\_at": "2025-12-25T06:37:28.000000Z",<br>"updated\_at": "2025-12-25T06:37:28.000000Z",<br>"deleted\_at": null<br>}<br>\]<br>} |

### CREATE / STORE

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Status created successfully",<br>"data": {<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar",<br>"updated\_at": "2025-12-25T06:33:25.000000Z",<br>"created\_at": "2025-12-25T06:33:25.000000Z",<br>"id": 1<br>}<br>}<br><br>error status sudah ada<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>} |

### UPDATE

#### Poly Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar"<br>}<br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Status updated successfully",<br>"data": {<br>"id": 1,<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar",<br>"created\_at": "2025-12-25T06:33:25.000000Z",<br>"updated\_at": "2025-12-25T06:33:25.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "Status not found"<br>}<br><br>error poly sudah ada<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>} |

### DETAIL

#### Poly Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": {<br>"id": 3,<br>"status\_name": "ANAMNESA",<br>"label": "Anamnesa",<br>"information": "Sedang pemeriksaan oleh perawat",<br>"created\_at": "2025-12-25T06:35:34.000000Z",<br>"updated\_at": "2025-12-25T06:35:34.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>    "status": "error",<br>    "message": "Status not found"<br>} |

### DELETE / DESTROY

#### Poly Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Status deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Status not found"<br>} |

### TRASHED
list poly yang dihapus (softdelete)

#### Poly Trashed

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status/trashed |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"data": \[<br>{<br>"id": 1,<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar",<br>"created\_at": "2025-12-25T06:33:25.000000Z",<br>"updated\_at": "2025-12-25T06:41:22.000000Z",<br>"deleted\_at": "2025-12-25T06:41:22.000000Z"<br>}<br>\]<br>} |

### RESTORE

#### Poly Restore

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/status/{id}/restore |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Status restored successfully",<br>"data": {<br>"id": 1,<br>"status\_name": "REGISTERED",<br>"label": "Terdaftar",<br>"information": "Sudah daftar",<br>"created\_at": "2025-12-25T06:33:25.000000Z",<br>"updated\_at": "2025-12-25T06:42:02.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Status not found or not deleted"<br>} |

## Schedule

### SELECT

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/schedule |
|  | {Base\_URL}/api/schedule?doctor\_id=3&date=2025-12-15month=12&year=2025 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Params | doctor\_id : int<br>date : Y-m-d<br>month : m<br>year : Y<br><br>PRIORITY DATE FILTER<br>date (exact)<br>month + year<br>month only<br>year only |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Schedules retrieved successfully.",<br>"data": \[<br>{<br>"id": 4,<br>"doctor\_id": 3,<br>"date": "2025-12-15",<br>"start\_time": "10:00:00",<br>"end\_time": "16:00:00",<br>"created\_at": "2025-12-15T07:38:30.000000Z",<br>"updated\_at": "2025-12-17T03:56:48.000000Z",<br>"deleted\_at": null,<br>"doctor": {<br>"id": 3,<br>"name": "Harris A",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T14:34:06.000000Z",<br>"updated\_at": "2025-12-13T14:38:51.000000Z",<br>"poly\_id": 1,<br>"username": "harris",<br>"deleted\_at": null<br>}<br>},<br>{<br>... data 2 ...<br>},<br>{<br>... data 3 ...<br>}<br>\]<br>} |

### CREATE / STORE

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/schedule |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"doctor\_id": "3",<br>"date": "2025-12-16",<br>"start\_time": "10:00",<br>"end\_time": "15:00",<br>"quota": 25 // nullable<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Schedule created successfully.",<br>"data": {<br>"doctor\_id": "3",<br>"date": "2025-12-16",<br>"start\_time": "10:00",<br>"end\_time": "15:00",<br>"updated\_at": "2025-12-17T03:47:37.000000Z",<br>"created\_at": "2025-12-17T03:47:37.000000Z",<br>"id": 5<br>}<br>}<br><br>error jika jadwal dokter bartabrakan dengan jadwal yg ada<br>{<br>"status": "error",<br>"message": "The schedule conflicts with an existing schedule for this doctor."<br>} |

### UPDATE

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/schedule/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"doctor\_id": "3",<br>"date": "2025-12-16",<br>"start\_time": "10:00",<br>"end\_time": "13:00",<br>"quota": 25 // nullable<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Schedule updated successfully.",<br>"data": {<br>"id": 5,<br>"doctor\_id": 3,<br>"date": "2025-12-16",<br>"start\_time": "10:00",<br>"end\_time": "13:00",<br>"created\_at": "2025-12-17T03:47:37.000000Z",<br>"updated\_at": "2025-12-17T03:50:49.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error jika jadwal dokter bartabrakan dengan jadwal yg ada<br>{<br>"status": "error",<br>"message": "The schedule conflicts with an existing schedule for this doctor."<br>} |

### DETAIL

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/schedule/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Schedule retrieved successfully.",<br>"data": {<br>"id": 4,<br>"doctor\_id": 3,<br>"date": "2025-12-15",<br>"start\_time": "10:00:00",<br>"end\_time": "16:00:00",<br>"created\_at": "2025-12-15T07:38:30.000000Z",<br>"updated\_at": "2025-12-17T03:56:48.000000Z",<br>"deleted\_at": null,<br>"doctor": {<br>"id": 3,<br>"name": "Harris A",<br>"email": "[harris@mail.com](mailto:harris@mail.com)",<br>"email\_verified\_at": null,<br>"created\_at": "2025-12-13T14:34:06.000000Z",<br>"updated\_at": "2025-12-13T14:38:51.000000Z",<br>"poly\_id": 1,<br>"username": "harris",<br>"deleted\_at": null<br>}<br>}<br>}<br><br> |

### DELETE / DESTROY

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/schedule/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Schedule deleted successfully."<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "Schedule not found."<br>} |

## Reservation

### SELECT

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reservation |
|  | {{BASE\_URL}}/api/reservation?page=1&per\_page=2&poly\_id=1&status\_id=2&date=2025-12-30&search=90 |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | page<br>per\_page<br>poly\_id<br>status\_id<br>date<br>search (untuk mencari data berdasarkan nama pasien/wa/nobpjs) |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation list retrieved successfully",<br>"data": {<br>"current\_page": 1,<br>"data": \[<br>{<br>"id": 9,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-30",<br>"bpjs": true,<br>"status\_id": 2,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T08:16:52.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 2,<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T06:47:30.000000Z",<br>"updated\_at": "2025-12-25T07:58:05.000000Z",<br>"deleted\_at": null<br>},<br>"queue": {<br>"id": 1,<br>"reservation\_id": 9,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2025-12-30",<br>"re\_reservation\_time": "07:34:00",<br>"call\_time": null,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T07:34:00.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 2,<br>"status\_name": "ANAMNESA",<br>"label": "Anamnesa",<br>"information": "Sedang pemeriksaan oleh perawat",<br>"created\_at": "2025-12-25T06:35:34.000000Z",<br>"updated\_at": "2025-12-25T06:35:34.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>},<br>{<br>... data 2 ...<br>},<br>{<br>... data 3 ...<br>},<br>{<br>... data 4 ...<br>}<br>\],<br>"first\_page\_url": "[http://127.0.0.1:8000/api/reservation?page=1](http://127.0.0.1:8000/api/reservation?page=1)",<br>"from": 1,<br>"last\_page": 1,<br>"last\_page\_url": "[http://127.0.0.1:8000/api/reservation?page=1](http://127.0.0.1:8000/api/reservation?page=1)",<br>"links": \[<br>{<br>"url": null,<br>"label": "&laquo; Previous",<br>"page": null,<br>"active": false<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/reservation?page=1](http://127.0.0.1:8000/api/reservation?page=1)",<br>"label": "1",<br>"page": 1,<br>"active": true<br>},<br>{<br>"url": null,<br>"label": "Next &raquo;",<br>"page": null,<br>"active": false<br>}<br>\],<br>"next\_page\_url": null,<br>"path": "[http://127.0.0.1:8000/api/reservation](http://127.0.0.1:8000/api/reservation)",<br>"per\_page": 10,<br>"prev\_page\_url": null,<br>"to": 4,<br>"total": 4<br>}<br>}<br> |

### CREATE / STORE
Mendaftarkan pasien dan **generate nomor antrian**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reservation |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br><br>"poly\_id": 1,<br>"schedule\_id": 1,<br>"bpjs": true,<br>"date": "2025-01-10"<br>}<br><br>schedule\_id = nullable, jika null akan dicarikan jadwal terdekat |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation successfully created",<br>"data": {<br>"patient": {<br>"patient\_name": "Saipul Anwar",<br>"whatsapp\_number": "081234567890",<br>"no\_bpjs": "0001234567890",<br>"email": "[saipan@gmail.com](mailto:saipan@gmail.com)",<br>"updated\_at": "2025-12-29T06:15:48.000000Z",<br>"created\_at": "2025-12-29T06:15:48.000000Z",<br>"id": 2<br>},<br>"reservation": {<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"bpjs": true,<br>"date": "2025-12-29",<br>"status\_id": 1,<br>"updated\_at": "2025-12-29T06:15:48.000000Z",<br>"created\_at": "2025-12-29T06:15:48.000000Z",<br>"id": 2,<br>"status": {<br>"id": 1,<br>"status\_name": "WAITING",<br>"label": "Menunggu",<br>"information": "Menunggu dipanggil anamnesa",<br>"created\_at": "2025-12-25T06:34:58.000000Z",<br>"updated\_at": "2025-12-25T06:34:58.000000Z",<br>"deleted\_at": null<br>}<br>},<br>"queue": {<br>"reservation\_id": 2,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2025-12-29",<br>"re\_reservation\_time": "06:15:48",<br>"updated\_at": "2025-12-29T06:15:48.000000Z",<br>"created\_at": "2025-12-29T06:15:48.000000Z",<br>"id": 1<br>}<br>}<br>}<br><br>error validation<br>{<br>    "status": "error",<br>    "message": "Validation failed",<br>    "errors": {<br>        "email": \[<br>            "The email field must be a valid email address."<br>        \]<br>    }<br>}<br><br>error jika no wa & no bpjs sudah terdaftar tapi dengan nama berbeda<br>{<br>    "status": "error",<br>    "message": "WhatsApp number or BPJS number is already registered with a different patient name"<br>}<br><br>error jika pada jadwal tersebut kuota pasien telah penuh<br>{<br>    "status": "error",<br>    "message": "Quota is full"<br>}<br><br>error database<br>{<br>"status": "error",<br>"message": "Internal server error",<br>"errors": {<br>"errorInfo": \[<br>"42P01",<br>7,<br>"ERROR: relation \\"polies\\" does not exist\\nLINE 1: select count(\*) as aggregate from \\"polies\\" where \\"id\\" = $1\\n ^"<br>\],<br>"connectionName": "pgsql"<br>}<br>} |

### UPDATE
hanya update informasi reservasi dan pasien tanpa mengubah nomor antrian

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reservation/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br><br>"poly\_id": 1,<br>"bpjs": true,<br>"date": "2025-01-10"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation successfully updated",<br>"data": {<br>"patient": {<br>"id": 2,<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T06:47:30.000000Z",<br>"updated\_at": "2025-12-25T07:54:40.000000Z",<br>"deleted\_at": null<br>},<br>"reservation": {<br>"id": 9,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-30",<br>"bpjs": true,<br>"status\_id": 1,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T07:34:00.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 2,<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T06:47:30.000000Z",<br>"updated\_at": "2025-12-25T07:54:40.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 1,<br>"status\_name": "WAITING",<br>"label": "Menunggu",<br>"information": "Menunggu dipanggil anamnesa",<br>"created\_at": "2025-12-25T06:34:58.000000Z",<br>"updated\_at": "2025-12-25T06:34:58.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>}<br><br>error database<br>{<br>"status": "error",<br>"message": "Internal server error",<br>"errors": {<br>"errorInfo": \[<br>"42P01",<br>7,<br>"ERROR: relation \\"polies\\" does not exist\\nLINE 1: select count(\*) as aggregate from \\"polies\\" where \\"id\\" = $1\\n ^"<br>\],<br>"connectionName": "pgsql"<br>}<br>} |

### DETAIL
menampilkan detail reservasi lengkap dengan data pasien dan antrian

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reservation/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation detail retrieved successfully",<br>"data": {<br>"reservation": {<br>"id": 12,<br>"patient\_id": 7,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-30",<br>"bpjs": true,<br>"status\_id": 1,<br>"created\_at": "2025-12-25T08:03:26.000000Z",<br>"updated\_at": "2025-12-25T08:03:26.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 7,<br>"patient\_name": "Dadang Conelo",<br>"no\_bpjs": "0001234567892",<br>"whatsapp\_number": "081234567892",<br>"email": "[dangcon@gmail.com](mailto:dangcon@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T08:03:26.000000Z",<br>"updated\_at": "2025-12-25T08:03:26.000000Z",<br>"deleted\_at": null<br>},<br>"queue": {<br>"id": 4,<br>"reservation\_id": 12,<br>"poly\_id": 1,<br>"queue\_number": 3,<br>"date": "2025-12-30",<br>"re\_reservation\_time": "08:03:26",<br>"call\_time": null,<br>"created\_at": "2025-12-25T08:03:26.000000Z",<br>"updated\_at": "2025-12-25T08:03:26.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 1,<br>"status\_name": "WAITING",<br>"label": "Menunggu",<br>"information": "Menunggu dipanggil anamnesa",<br>"created\_at": "2025-12-25T06:34:58.000000Z",<br>"updated\_at": "2025-12-25T06:34:58.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

## Queue

### PER STATUS
#### ANAMNESA
update status jadi **anamnesa**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/{id}/anamnesa |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Anamnesa call processed successfully",<br>"webhook\_status": "error",<br>"webhook\_message": "cURL error 60: SSL certificate problem: unable to get local issuer certificate (see [https://curl.haxx.se/libcurl/c/libcurl-errors.html](https://curl.haxx.se/libcurl/c/libcurl-errors.html)) for [https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974](https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974)",<br>"data": {<br>"queue\_number": 1,<br>"number\_of\_calls": 1,<br>"reservation": {<br>"id": 2,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-29",<br>"bpjs": true,<br>"status\_id": 4,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-03T06:14:08.000000Z",<br>"deleted\_at": null,<br>"queue": {<br>"id": 1,<br>"reservation\_id": 2,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2026-01-08",<br>"re\_reservation\_time": "06:15:48",<br>"call\_time": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-10T04:56:46.000000Z",<br>"deleted\_at": null,<br>"number\_of\_calls": 1,<br>"notification\_status": false<br>},<br>"patient": {<br>"id": 2,<br>"patient\_name": "Andi Wijaya",<br>"no\_bpjs": "1234567890123",<br>"whatsapp\_number": "628123456789",<br>"email": "[andi@mail.com](mailto:andi@mail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-08T06:39:40.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 4,<br>"status\_name": "WITH\_DOCTOR",<br>"label": "Dengan Dokter",<br>"information": "Sedang konsultasi dengan dokter",<br>"created\_at": "2025-12-24T23:36:04.000000Z",<br>"updated\_at": "2025-12-24T23:36:04.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>jika sudah memanggil >= 3<br>{<br>    "status": "error",<br>    "message": "Maximum number of calls reached (3 times)",<br>    "data": {<br>        "number\_of\_calls": 3<br>    }<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

#### WAITING DOCTOR
update status jadi **waiting\_doctor**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/{id}/waitingdoctor |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation moved to waiting doctor successfully",<br>"data": {<br>"reservation": {<br>"id": 2,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-29",<br>"bpjs": true,<br>"status\_id": 3,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-10T05:04:03.000000Z",<br>"deleted\_at": null,<br>"queue": {<br>"id": 1,<br>"reservation\_id": 2,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2026-01-08",<br>"re\_reservation\_time": "06:15:48",<br>"call\_time": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-10T05:04:03.000000Z",<br>"deleted\_at": null,<br>"number\_of\_calls": 0,<br>"notification\_status": false<br>},<br>"patient": {<br>"id": 2,<br>"patient\_name": "Andi Wijaya",<br>"no\_bpjs": "1234567890123",<br>"whatsapp\_number": "628123456789",<br>"email": "[andi@mail.com](mailto:andi@mail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-08T06:39:40.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 3,<br>"status\_name": "WAITING\_DOCTOR",<br>"label": "Menunggu Dokter",<br>"information": "Selesai anamnesis, menunggu dokter",<br>"created\_at": "2025-12-24T23:35:34.000000Z",<br>"updated\_at": "2025-12-24T23:35:34.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

#### WITH DOCTOR
update status jadi **withdoctor**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/{id}/withdoctor |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "With doctor call processed successfully",<br>"webhook\_status": "error",<br>"webhook\_message": "cURL error 60: SSL certificate problem: unable to get local issuer certificate (see [https://curl.haxx.se/libcurl/c/libcurl-errors.html](https://curl.haxx.se/libcurl/c/libcurl-errors.html)) for [https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974](https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974)",<br>"data": {<br>"queue\_number": 1,<br>"number\_of\_calls": 1,<br>"call\_time": "2026-01-10T05:07:34.112425Z",<br>"reservation": {<br>"id": 2,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-29",<br>"bpjs": true,<br>"status\_id": 4,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-10T05:07:34.000000Z",<br>"deleted\_at": null,<br>"queue": {<br>"id": 1,<br>"reservation\_id": 2,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2026-01-08",<br>"re\_reservation\_time": "06:15:48",<br>"call\_time": "12:07:34",<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-10T05:07:34.000000Z",<br>"deleted\_at": null,<br>"number\_of\_calls": 1,<br>"notification\_status": false<br>},<br>"patient": {<br>"id": 2,<br>"patient\_name": "Andi Wijaya",<br>"no\_bpjs": "1234567890123",<br>"whatsapp\_number": "628123456789",<br>"email": "[andi@mail.com](mailto:andi@mail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-08T06:39:40.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 4,<br>"status\_name": "WITH\_DOCTOR",<br>"label": "Dengan Dokter",<br>"information": "Sedang konsultasi dengan dokter",<br>"created\_at": "2025-12-24T23:36:04.000000Z",<br>"updated\_at": "2025-12-24T23:36:04.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>jika suda dipanggil >= 3<br>{<br>    "status": "error",<br>    "message": "Maximum number of calls reached (3 times)",<br>    "data": {<br>        "number\_of\_calls": 3<br>    }<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

#### DONE
update status jadi **done**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/{id}/done |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation finish",<br>"data": {<br>"reservation": {<br>"id": 9,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"date": "2025-12-30",<br>"bpjs": true,<br>"status\_id": 4,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T09:01:10.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 2,<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T06:47:30.000000Z",<br>"updated\_at": "2025-12-25T07:58:05.000000Z",<br>"deleted\_at": null<br>},<br>"queue": {<br>"id": 1,<br>"reservation\_id": 9,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2025-12-30",<br>"re\_reservation\_time": "07:34:00",<br>"call\_time": null,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T07:34:00.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 4,<br>"status\_name": "DONE",<br>"label": "Selesai",<br>"information": "Selesai, bisa ambil obat/pulang",<br>"created\_at": "2025-12-25T06:36:35.000000Z",<br>"updated\_at": "2025-12-25T06:36:35.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

#### NO-SHOW
update status jadi **no-show**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/{id}/noshow |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation moved to no show successfully",<br>"data": {<br>"reservation": {<br>"id": 9,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"date": "2025-12-30",<br>"bpjs": true,<br>"status\_id": 5,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T09:02:26.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 2,<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T06:47:30.000000Z",<br>"updated\_at": "2025-12-25T07:58:05.000000Z",<br>"deleted\_at": null<br>},<br>"queue": {<br>"id": 1,<br>"reservation\_id": 9,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2025-12-30",<br>"re\_reservation\_time": "07:34:00",<br>"call\_time": null,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T07:34:00.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 5,<br>"status\_name": "NO\_SHOW",<br>"label": "Tidak Hadir",<br>"information": "Tidak datang saat dipanggil",<br>"created\_at": "2025-12-25T06:36:56.000000Z",<br>"updated\_at": "2025-12-25T06:36:56.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

#### CANCELLED
update status jadi **cancelled**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/{id}/cancelled |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation moved to cancelled successfully",<br>"data": {<br>"reservation": {<br>"id": 9,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"date": "2025-12-30",<br>"bpjs": true,<br>"status\_id": 6,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T09:02:59.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 2,<br>"patient\_name": "Ahmad Fauzi",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[ahmad.fauzi@gmail.com](mailto:ahmad.fauzi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-25T06:47:30.000000Z",<br>"updated\_at": "2025-12-25T07:58:05.000000Z",<br>"deleted\_at": null<br>},<br>"queue": {<br>"id": 1,<br>"reservation\_id": 9,<br>"poly\_id": 1,<br>"queue\_number": 1,<br>"date": "2025-12-30",<br>"re\_reservation\_time": "07:34:00",<br>"call\_time": null,<br>"created\_at": "2025-12-25T07:34:00.000000Z",<br>"updated\_at": "2025-12-25T07:34:00.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 6,<br>"status\_name": "CANCELLED",<br>"label": "Dibatalkan",<br>"information": "Batal oleh pasien atau admin",<br>"created\_at": "2025-12-25T06:37:28.000000Z",<br>"updated\_at": "2025-12-25T06:37:28.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>error reservasi tidak ada / salah  id<br>{<br>"status": "error",<br>"message": "Reservation not found"<br>} |

###

### ANTREAN
#### Queue List (Index)
Menampilkan list antrian berdasarkan filter yang diinput

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/ |
|  | {{BASE\_URL}}/api/queue/?poly\_id=1&date=2025-12-29&status\_id=1&page=1&per\_page=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | per\_page<br>page<br>poly\_id<br>status\_id<br>date |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Queue list retrieved successfully",<br>"data": {<br>"current\_page": 1,<br>"data": \[<br>{<br>"id": 1,<br>"reservation\_id": 2,<br>"poly\_id": 1,<br>"queue\_number": "1",<br>"date": "2025-12-29",<br>"re\_reservation\_time": "06:15:48",<br>"call\_time": null,<br>"created\_at": "2025-12-29T06:15:48.000000Z",<br>"updated\_at": "2025-12-29T06:15:48.000000Z",<br>"deleted\_at": null,<br>"reservation": {<br>"id": 2,<br>"patient\_id": 2,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-29",<br>"bpjs": true,<br>"status\_id": 1,<br>"created\_at": "2025-12-29T06:15:48.000000Z",<br>"updated\_at": "2025-12-29T06:15:48.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 2,<br>"patient\_name": "Saipul Anwar",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "081234567890",<br>"email": "[saipan@gmail.com](mailto:saipan@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-29T06:15:48.000000Z",<br>"updated\_at": "2025-12-29T06:15:48.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 1,<br>"status\_name": "WAITING",<br>"label": "Menunggu",<br>"information": "Menunggu dipanggil anamnesa",<br>"created\_at": "2025-12-25T06:34:58.000000Z",<br>"updated\_at": "2025-12-25T06:34:58.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>},<br>{<br>"id": 2,<br>"reservation\_id": 3,<br>"poly\_id": 1,<br>"queue\_number": "2",<br>"date": "2025-12-29",<br>"re\_reservation\_time": "06:16:43",<br>"call\_time": null,<br>"created\_at": "2025-12-29T06:16:43.000000Z",<br>"updated\_at": "2025-12-29T06:16:43.000000Z",<br>"deleted\_at": null,<br>"reservation": {<br>"id": 3,<br>"patient\_id": 3,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-29",<br>"bpjs": true,<br>"status\_id": 1,<br>"created\_at": "2025-12-29T06:16:43.000000Z",<br>"updated\_at": "2025-12-29T06:16:43.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "081234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-29T06:16:43.000000Z",<br>"updated\_at": "2025-12-29T06:16:43.000000Z",<br>"deleted\_at": null<br>},<br>"status": {<br>"id": 1,<br>"status\_name": "WAITING",<br>"label": "Menunggu",<br>"information": "Menunggu dipanggil anamnesa",<br>"created\_at": "2025-12-25T06:34:58.000000Z",<br>"updated\_at": "2025-12-25T06:34:58.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 1,<br>"name": "Poli Umum",<br>"created\_at": "2025-12-13T13:15:15.000000Z",<br>"updated\_at": "2025-12-13T13:15:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>\],<br>"first\_page\_url": "[http://127.0.0.1:8000/api/queue?page=1](http://127.0.0.1:8000/api/queue?page=1)",<br>"from": 1,<br>"last\_page": 2,<br>"last\_page\_url": "[http://127.0.0.1:8000/api/queue?page=2](http://127.0.0.1:8000/api/queue?page=2)",<br>"links": \[<br>{<br>"url": null,<br>"label": "&laquo; Previous",<br>"page": null,<br>"active": false<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/queue?page=1](http://127.0.0.1:8000/api/queue?page=1)",<br>"label": "1",<br>"page": 1,<br>"active": true<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/queue?page=2](http://127.0.0.1:8000/api/queue?page=2)",<br>"label": "2",<br>"page": 2,<br>"active": false<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/queue?page=2](http://127.0.0.1:8000/api/queue?page=2)",<br>"label": "Next &raquo;",<br>"page": 2,<br>"active": false<br>}<br>\],<br>"next\_page\_url": "[http://127.0.0.1:8000/api/queue?page=2](http://127.0.0.1:8000/api/queue?page=2)",<br>"path": "[http://127.0.0.1:8000/api/queue](http://127.0.0.1:8000/api/queue)",<br>"per\_page": 2,<br>"prev\_page\_url": null,<br>"to": 2,<br>"total": 3<br>}<br>} |

#### Current Queue
Menampilkan nomor antrian yang statusnya sedang diperiksa oleh dokter **(STATUS = 4)**

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/currnet |
|  | {{BASE\_URL}}/api/queue/current?poly\_id=1&date=2025-12-29 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | poly\_id -> required<br>date -> required |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Current queue retrieved successfully",<br>"queue\_number\_anamnesa": 3,<br>"queue\_number\_with\_doctor": 1<br>}<br><br>jika masih kosong<br>{<br>"status": "success",<br>"message": "No current queue",<br>"queue\_number\_anamnesa": null,<br>"queue\_number\_with\_doctor": null<br>} |

#### Call Next Queue
Memanggil nomor antrian berikutnya dengan ketentuan/alur berikut:
*   Finish **Current Queue**
Nomor antrian sekarang (current queue) statusnya diupdate **4 → 5** (artinya pemeriksaan selesai)
*   Call Next **Waiting Doctor** Queue
Nomor antrian berikutnya statusnya diupdate **3 → 4** (artinya nomor antrian yang dipanggil lanjut ke pemeriksaan dokter)

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/queue/call-next |
| Method | PATCH |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"poly\_id": "1",<br>"date": "2025-12-29"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Queue processed successfully",<br>"queue\_number\_with\_doctor": 2,<br>"webhook\_status": "error",<br>"webhook\_message": "cURL error 60: SSL certificate problem: unable to get local issuer certificate (see [https://curl.haxx.se/libcurl/c/libcurl-errors.html](https://curl.haxx.se/libcurl/c/libcurl-errors.html)) for [https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974](https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974)",<br>"data": {<br>"finished": null,<br>"current": {<br>"id": 3,<br>"patient\_id": 3,<br>"poly\_id": 1,<br>"schedule\_id": 7,<br>"date": "2025-12-29",<br>"bpjs": true,<br>"status\_id": 4,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2026-01-10T05:25:24.000000Z",<br>"deleted\_at": null,<br>"queue": {<br>"id": 2,<br>"reservation\_id": 3,<br>"poly\_id": 1,<br>"queue\_number": 2,<br>"date": "2026-01-08",<br>"re\_reservation\_time": "06:16:43",<br>"call\_time": "2026-01-10T05:25:24.755207Z",<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2026-01-10T05:25:24.000000Z",<br>"deleted\_at": null,<br>"number\_of\_calls": 1,<br>"notification\_status": false<br>},<br>"patient": {<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "6281234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2025-12-28T23:16:43.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br>}<br><br>jika tidak ada antrian<br>{<br>    "status": "success",<br>    "message": "No queue to call",<br>    "queue\_number\_with\_doctor": null,<br>    "webhook\_status": "skipped",<br>    "webhook\_message": "Queue not found"<br>}<br><br>jika body salah<br>{<br>"message": "The poly id field is required. (and 1 more error)",<br>"errors": {<br>"poly\_id": \[<br>"The poly id field is required."<br>\],<br>"date": \[<br>"The date field is required."<br>\]<br>}<br>} |

## Patient

### SELECT

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/patients |
|  | {Base\_URL}/api/patients?search=andi&page=1&per\_page=10 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Params | search<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Patient list retrieved successfully",<br>"data": {<br>"current\_page": 1,<br>"data": \[<br>{<br>"id": 4,<br>"patient\_name": "Ansori",<br>"no\_bpjs": "0001234567892",<br>"whatsapp\_number": "6281234567892",<br>"email": "[ansori@gmail.com](mailto:ansori@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:17:09.000000Z",<br>"updated\_at": "2025-12-28T23:17:09.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "6281234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2025-12-28T23:16:43.000000Z",<br>"deleted\_at": null<br>},<br>{<br>"id": 2,<br>"patient\_name": "Saipul Anwar",<br>"no\_bpjs": "0001234567890",<br>"whatsapp\_number": "6281234567890",<br>"email": "[saipan@gmail.com](mailto:saipan@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2025-12-28T23:15:48.000000Z",<br>"deleted\_at": null<br>}<br>\],<br>"first\_page\_url": "[http://127.0.0.1:8000/api/patients?page=1](http://127.0.0.1:8000/api/patients?page=1)",<br>"from": 1,<br>"last\_page": 1,<br>"last\_page\_url": "[http://127.0.0.1:8000/api/patients?page=1](http://127.0.0.1:8000/api/patients?page=1)",<br>"links": \[<br>{<br>"url": null,<br>"label": "&laquo; Previous",<br>"page": null,<br>"active": false<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/patients?page=1](http://127.0.0.1:8000/api/patients?page=1)",<br>"label": "1",<br>"page": 1,<br>"active": true<br>},<br>{<br>"url": null,<br>"label": "Next &raquo;",<br>"page": null,<br>"active": false<br>}<br>\],<br>"next\_page\_url": null,<br>"path": "[http://127.0.0.1:8000/api/patients](http://127.0.0.1:8000/api/patients)",<br>"per\_page": 10,<br>"prev\_page\_url": null,<br>"to": 3,<br>"total": 3<br>}<br>} |

### UPDATE

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/patients/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"patient\_name": "Andi Wijaya",<br>"whatsapp\_number": "08123456789",<br>"no\_bpjs": "1234567890123",<br>"email": "[andi@mail.com](mailto:andi@mail.com)"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Patient updated successfully",<br>"data": {<br>"id": 2,<br>"patient\_name": "Andi Wijaya",<br>"no\_bpjs": "1234567890123",<br>"whatsapp\_number": "08123456789",<br>"email": "[andi@mail.com](mailto:andi@mail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-08T06:34:40.000000Z",<br>"deleted\_at": null<br>}<br>}<br> |

### DETAIL

#### Poly Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/patients/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Patient detail retrieved successfully",<br>"data": {<br>"id": 2,<br>"patient\_name": "Andi Wijaya",<br>"no\_bpjs": "1234567890123",<br>"whatsapp\_number": "08123456789",<br>"email": "[andi@mail.com](mailto:andi@mail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:15:48.000000Z",<br>"updated\_at": "2026-01-08T06:34:40.000000Z",<br>"deleted\_at": null<br>}<br>} |

## Message Template

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/message-templates |
|  | {Base\_URL}/api/message-templates?search=reminder&page=1&per\_page=10 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Message templates retrieved successfully",<br>"data": {<br>"current\_page": 1,<br>"data": \[<br>{<br>"id": 1,<br>"template\_name": "Reminder H-1",<br>"message": "Dear {{patient\_name}}, your appointment is tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T06:57:33.000000Z",<br>"deleted\_at": null<br>}<br>\],<br>"first\_page\_url": "[http://127.0.0.1:8000/api/message-templates?page=1](http://127.0.0.1:8000/api/message-templates?page=1)",<br>"from": 1,<br>"last\_page": 1,<br>"last\_page\_url": "[http://127.0.0.1:8000/api/message-templates?page=1](http://127.0.0.1:8000/api/message-templates?page=1)",<br>"links": \[<br>{<br>"url": null,<br>"label": "&laquo; Previous",<br>"page": null,<br>"active": false<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/message-templates?page=1](http://127.0.0.1:8000/api/message-templates?page=1)",<br>"label": "1",<br>"page": 1,<br>"active": true<br>},<br>{<br>"url": null,<br>"label": "Next &raquo;",<br>"page": null,<br>"active": false<br>}<br>\],<br>"next\_page\_url": null,<br>"path": "[http://127.0.0.1:8000/api/message-templates](http://127.0.0.1:8000/api/message-templates)",<br>"per\_page": 10,<br>"prev\_page\_url": null,<br>"to": 1,<br>"total": 1<br>}<br>}<br> |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/message-templates |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"template\_name": "Reminder H-1",<br>"message": "Dear {{patient\_name}}, your appointment is tomorrow."<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Message template created successfully",<br>"data": {<br>"template\_name": "Reminder H-1",<br>"message": "Dear {{patient\_name}}, your appointment is tomorrow.",<br>"updated\_at": "2026-01-08T06:57:33.000000Z",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"id": 1<br>}<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "The template name field is required.",<br>"errors": {<br>"template\_name": \[<br>"The template name field is required."<br>\],<br>"message": \[<br>"The message field is required."<br>\]<br>}<br>}<br> |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/message-templates/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow."<br>}<br><br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Message template updated successfully",<br>"data": {<br>"id": 1,<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T07:10:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "Message template not found"<br>}<br> |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/message-templates/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Message template retrieved successfully",<br>"data": {<br>"id": 1,<br>"template\_name": "Reminder H-1",<br>"message": "Dear {{patient\_name}}, your appointment is tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T06:57:33.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Message template not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/message-templates/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Message Template deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>    "status": "error",<br>    "message": "Message Template not found"<br>} |

## Reminder Config

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reminder-configs |
|  | {Base\_URL}/api/reminder-configs?page=1&per\_page=10 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reminder configs retrieved successfully",<br>"data": {<br>"current\_page": 1,<br>"data": \[<br>{<br>"id": 1,<br>"message\_template\_id": 1,<br>"reminder\_offset": 30,<br>"reminder\_patient\_count": 5,<br>"reminder\_type": "QUEUE",<br>"created\_at": "2026-01-08T07:17:34.000000Z",<br>"updated\_at": "2026-01-08T07:17:34.000000Z",<br>"deleted\_at": null,<br>"message\_template": {<br>"id": 1,<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T07:10:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>\],<br>"first\_page\_url": "[http://127.0.0.1:8000/api/reminder-configs?page=1](http://127.0.0.1:8000/api/reminder-configs?page=1)",<br>"from": 1,<br>"last\_page": 1,<br>"last\_page\_url": "[http://127.0.0.1:8000/api/reminder-configs?page=1](http://127.0.0.1:8000/api/reminder-configs?page=1)",<br>"links": \[<br>{<br>"url": null,<br>"label": "&laquo; Previous",<br>"page": null,<br>"active": false<br>},<br>{<br>"url": "[http://127.0.0.1:8000/api/reminder-configs?page=1](http://127.0.0.1:8000/api/reminder-configs?page=1)",<br>"label": "1",<br>"page": 1,<br>"active": true<br>},<br>{<br>"url": null,<br>"label": "Next &raquo;",<br>"page": null,<br>"active": false<br>}<br>\],<br>"next\_page\_url": null,<br>"path": "[http://127.0.0.1:8000/api/reminder-configs](http://127.0.0.1:8000/api/reminder-configs)",<br>"per\_page": 10,<br>"prev\_page\_url": null,<br>"to": 1,<br>"total": 1<br>}<br>}<br> |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reminder-configs |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"message\_template\_id": 1,<br>"reminder\_offset": 30,<br>"reminder\_patient\_count": 5,<br>"reminder\_type": "QUEUE"<br>}<br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Reminder config created successfully",<br>"data": {<br>"message\_template\_id": 1,<br>"reminder\_offset": 30,<br>"reminder\_patient\_count": 5,<br>"reminder\_type": "QUEUE",<br>"updated\_at": "2026-01-08T07:17:34.000000Z",<br>"created\_at": "2026-01-08T07:17:34.000000Z",<br>"id": 1,<br>"message\_template": {<br>"id": 1,<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T07:10:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "The reminder patient count field is required.",<br>"errors": {<br>"reminder\_patient\_count": \[<br>"The reminder patient count field is required."<br>\],<br>"reminder\_type": \[<br>"The reminder type field is required."<br>\]<br>}<br>}<br> |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reminder-configs/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow."<br>}<br><br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Reminder config updated successfully",<br>"data": {<br>"id": 1,<br>"message\_template\_id": 1,<br>"reminder\_offset": 30,<br>"reminder\_patient\_count": 5,<br>"reminder\_type": "QUEUE",<br>"created\_at": "2026-01-08T07:17:34.000000Z",<br>"updated\_at": "2026-01-08T07:17:34.000000Z",<br>"deleted\_at": null,<br>"message\_template": {<br>"id": 1,<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T07:10:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "Reminder config not found"<br>}<br> |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reminder-configs/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reminder config retrieved successfully",<br>"data": {<br>"id": 1,<br>"message\_template\_id": 1,<br>"reminder\_offset": 30,<br>"reminder\_patient\_count": 5,<br>"reminder\_type": "QUEUE",<br>"created\_at": "2026-01-08T07:17:34.000000Z",<br>"updated\_at": "2026-01-08T07:17:34.000000Z",<br>"deleted\_at": null,<br>"message\_template": {<br>"id": 1,<br>"template\_name": "Reminder H-1 Updated",<br>"message": "Dear {{patient\_name}}, please remember your appointment tomorrow.",<br>"created\_at": "2026-01-08T06:57:33.000000Z",<br>"updated\_at": "2026-01-08T07:10:15.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Reminder config not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reminder-configs/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reminder config deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Reminder config not found"<br>} |

## Whatsapp Config

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/whatsapp-configs |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "WhatsApp config list retrieved successfully",<br>"data": \[<br>{<br>"id": 1,<br>"whatsapp\_number": "6281234567890",<br>"waha\_api\_url": "[https://waha.example.com/api/send](https://waha.example.com/api/send)",<br>"created\_at": "2026-01-08T07:53:14.000000Z",<br>"updated\_at": "2026-01-08T07:53:14.000000Z",<br>"deleted\_at": null<br>}<br>\]<br>} |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/whatsapp-configs |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"whatsapp\_number": "6281234567890",<br>"waha\_api\_url": "[https://waha.example.com/api/send](https://waha.example.com/api/send)"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "WhatsApp config created successfully",<br>"data": {<br>"whatsapp\_number": "6281234567890",<br>"waha\_api\_url": "[https://waha.example.com/api/send](https://waha.example.com/api/send)",<br>"updated\_at": "2026-01-08T07:53:14.000000Z",<br>"created\_at": "2026-01-08T07:53:14.000000Z",<br>"id": 1<br>}<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "The whatsapp number has already been taken.",<br>"errors": {<br>"whatsapp\_number": \[<br>"The whatsapp number has already been taken."<br>\]<br>}<br>} |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/whatsapp-configs/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"whatsapp\_number": "6281234567890",<br>"waha\_api\_url": "[https://waha.example.com/api/send](https://waha.example.com/api/send)"<br>}<br><br> |
| Response | success<br>{<br>"status": "success",<br>"message": "WhatsApp config updated successfully",<br>"data": {<br>"id": 1,<br>"whatsapp\_number": "6281234567890",<br>"waha\_api\_url": "[https://waha.example.com/api/send](https://waha.example.com/api/send)",<br>"created\_at": "2026-01-08T07:53:14.000000Z",<br>"updated\_at": "2026-01-08T07:53:14.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "WhatsApp config not found"<br>}<br> |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/whatsapp-configs/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "WhatsApp config retrieved successfully",<br>"data": {<br>"id": 1,<br>"whatsapp\_number": "6281234567890",<br>"waha\_api\_url": "[https://waha.example.com/api/send](https://waha.example.com/api/send)",<br>"created\_at": "2026-01-08T07:53:14.000000Z",<br>"updated\_at": "2026-01-08T07:53:14.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Whatsapp config not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/whatsapp-configs/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Whatsapp config deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Whatsapp config not found"<br>} |

## Config

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/configs |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br><br>"status": "success",<br>"message": "Config list retrieved successfully",<br>"data": \[<br>{<br>"id": 1,<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta",<br>"created\_at": null,<br>"updated\_at": "2026-01-08T08:06:30.000000Z",<br>"deleted\_at": null<br>}<br>\]<br>} |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/configs |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Config created successfully",<br>"data": {<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta",<br>"updated\_at": "2026-01-08T08:04:21.000000Z",<br>"created\_at": "2026-01-08T08:04:21.000000Z",<br>"id": 3<br>}<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "The name field is required.",<br>"errors": {<br>"name": \[<br>"The name field is required."<br>\],<br>"value": \[<br>"The value field is required."<br>\]<br>}<br>} |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/configs/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta"<br>}<br><br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Config updated successfully",<br>"data": {<br>"id": 1,<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta",<br>"created\_at": null,<br>"updated\_at": "2026-01-08T08:06:30.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "The name has already been taken.",<br>"errors": {<br>"name": \[<br>"The name has already been taken."<br>\]<br>}<br>}<br> |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/configs/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Config retrieved successfully",<br>"data": {<br>"id": 1,<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta",<br>"created\_at": null,<br>"updated\_at": "2026-01-08T08:06:30.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "config not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/configs/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Config deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Config not found"<br>} |

## Checkup Schedule

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/checkup-schedule |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | search<br>patient\_id<br>poly\_id<br>date<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Checkup schedules retrieved successfully",<br>"data": \[<br>{<br>"id": 1,<br>"patient\_id": 3,<br>"poly\_id": 2,<br>"date": "2026-01-15",<br>"description": "Routine dental check-up (updated)",<br>"created\_at": "2026-01-09T06:58:40.000000Z",<br>"updated\_at": "2026-01-09T06:59:35.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "6281234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2025-12-28T23:16:43.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 2,<br>"name": "Poli Gigi",<br>"created\_at": "2025-12-13T06:15:21.000000Z",<br>"updated\_at": "2025-12-13T06:15:21.000000Z",<br>"deleted\_at": null<br>}<br>}<br>\],<br>"meta": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 1,<br>"last\_page": 1<br>}<br>} |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/checkup-schedule |
| Method | POST |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"patient\_id": 12,<br>"poly\_id": 2,<br>"date": "2026-01-15",<br>"description": "Routine dental check-up"<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "Checkup schedule created successfully",<br>"data": {<br>"patient\_id": 3,<br>"poly\_id": 2,<br>"date": "2026-01-15",<br>"description": "Routine dental check-up",<br>"updated\_at": "2026-01-09T06:58:40.000000Z",<br>"created\_at": "2026-01-09T06:58:40.000000Z",<br>"id": 1,<br>"patient": {<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "6281234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2025-12-28T23:16:43.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 2,<br>"name": "Poli Gigi",<br>"created\_at": "2025-12-13T06:15:21.000000Z",<br>"updated\_at": "2025-12-13T06:15:21.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "The selected patient id is invalid.",<br>"errors": {<br>"patient\_id": \[<br>"The selected patient id is invalid."<br>\]<br>}<br>} |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/checkup-schedule/{id} |
| Method | PUT |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | {<br>"name": "clinic\_timezone",<br>"value": "Asia/Jakarta"<br>}<br><br> |
| Response | success<br>{<br>"status": "success",<br>"message": "Checkup schedule updated successfully",<br>"data": {<br>"id": 1,<br>"patient\_id": 3,<br>"poly\_id": 2,<br>"date": "2026-01-15",<br>"description": "Routine dental check-up (updated)",<br>"created\_at": "2026-01-09T06:58:40.000000Z",<br>"updated\_at": "2026-01-09T06:59:35.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "6281234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2025-12-28T23:16:43.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 2,<br>"name": "Poli Gigi",<br>"created\_at": "2025-12-13T06:15:21.000000Z",<br>"updated\_at": "2025-12-13T06:15:21.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "The selected patient id is invalid.",<br>"errors": {<br>"patient\_id": \[<br>"The selected patient id is invalid."<br>\]<br>}<br>}<br> |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/checkup-schedule/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Checkup schedule retrieved successfully",<br>"data": {<br>"id": 1,<br>"patient\_id": 3,<br>"poly\_id": 2,<br>"date": "2026-01-15",<br>"description": "Routine dental check-up (updated)",<br>"created\_at": "2026-01-09T06:58:40.000000Z",<br>"updated\_at": "2026-01-09T06:59:35.000000Z",<br>"deleted\_at": null,<br>"patient": {<br>"id": 3,<br>"patient\_name": "Rachmat Hidayat",<br>"no\_bpjs": "0001234567891",<br>"whatsapp\_number": "6281234567891",<br>"email": "[rachhi@gmail.com](mailto:rachhi@gmail.com)",<br>"chat\_id": null,<br>"created\_at": "2025-12-28T23:16:43.000000Z",<br>"updated\_at": "2025-12-28T23:16:43.000000Z",<br>"deleted\_at": null<br>},<br>"poly": {<br>"id": 2,<br>"name": "Poli Gigi",<br>"created\_at": "2025-12-13T06:15:21.000000Z",<br>"updated\_at": "2025-12-13T06:15:21.000000Z",<br>"deleted\_at": null<br>}<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Checkup schedule not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/checkup-schedule/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Checkup schedule deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Checkup schedule not found"<br>} |

## Faq

### SELECT

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/faq |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter |  |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "FAQ list retrieved successfully",<br>"data": \[<br>{<br>"id": 1,<br>"name": "faq ke 1 (updated)",<br>"file": "1767944736\_6960b22014ab8.pdf",<br>"created\_at": "2026-01-09T07:43:00.000000Z",<br>"updated\_at": "2026-01-09T07:45:36.000000Z",<br>"deleted\_at": null,<br>"directory": "[http://127.0.0.1:8000/storage/faq/1767944736\_6960b22014ab8.pdf](http://127.0.0.1:8000/storage/faq/1767944736_6960b22014ab8.pdf)"<br>}<br>\]<br>} |

### CREATE / STORE

#### Roles Create

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/faq |
| Method | POST |
| Header | Content-Type: application/json<br>Content-Type: multipart/form-data |
| Security | Bearer Token |
| Request Body | {<br>"name": "faq ke 1",<br>"file": { FILE },<br>} |
| Response | success<br>{<br>"status": "success",<br>"message": "FAQ created successfully",<br>"data": {<br>"name": "faq ke 1",<br>"file": "1767944579\_6960b183a35f1.pdf",<br>"updated\_at": "2026-01-09T07:43:00.000000Z",<br>"created\_at": "2026-01-09T07:43:00.000000Z",<br>"id": 1<br>}<br>}<br><br>error<br>{<br>"status": "error",<br>"message": "The file field is required.",<br>"errors": {<br>"file": \[<br>"The file field is required."<br>\]<br>}<br>} |

### UPDATE

#### Roles Update

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/faq/{id} |
| Method | PUT |
| Header | Content-Type: application/json<br>Content-Type: multipart/form-data |
| Security | Bearer Token |
| Request Body | {<br>"name": "faq ke 1",<br>"file": { FILE },<br>}<br><br> |
| Response | success<br>{<br>"status": "success",<br>"message": "FAQ updated successfully",<br>"data": {<br>"id": 1,<br>"name": "faq ke 1 (updated)",<br>"file": "1767944736\_6960b22014ab8.pdf",<br>"created\_at": "2026-01-09T07:43:00.000000Z",<br>"updated\_at": "2026-01-09T07:45:36.000000Z",<br>"deleted\_at": null<br>}<br>}<br><br>error id tidak ditemukan<br>{<br>"status": "error",<br>"message": "The file field is required.",<br>"errors": {<br>"file": \[<br>"The file field is required."<br>\]<br>}<br>} |

### DETAIL

#### Roles Detail

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/faq/{id} |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "FAQ detail retrieved successfully",<br>"data": {<br>"id": 1,<br>"name": "faq ke 1 (updated)",<br>"file": "1767944736\_6960b22014ab8.pdf",<br>"created\_at": "2026-01-09T07:43:00.000000Z",<br>"updated\_at": "2026-01-09T07:45:36.000000Z",<br>"deleted\_at": null,<br>"directory": "[http://127.0.0.1:8000/storage/faq/1767944736\_6960b22014ab8.pdf](http://127.0.0.1:8000/storage/faq/1767944736_6960b22014ab8.pdf)"<br>}<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Faq not found"<br>} |

### DELETE / DESTROY

#### Roles Delete

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/faq/{id} |
| Method | DELETE |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Faq deleted successfully"<br>}<br><br>error id salah/tidak ada data<br>{<br>"status": "error",<br>"message": "Faq not found"<br>} |

## N8N Integration

**WEBHOOK**
Untuk memanggil Antrian saat ini dan 2 antrian berikutnya

| Field | Value |
| --- | --- |
| URL | `https://n8naws.keuangan.online/webhook-test/a2158f48-99c8-4904-812a-01c1fa325974` |
| Method | `POST` |
| Type | Webhook |
| Body | `{`<br>    `"current_queue":"1",`<br>    `"status" : "ANAMNESA", // ANAMNESA, WITH_DOCTOR`<br>    `"poly": 1 // gigi, umum`<br>`}` |
| Response | `{`<br>    `"MessageSent": 3`<br>`}` |

## Dashboard

### SUMMARY

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/summary |
|  | /api/dashboard/summary?date=2026-01-10<br>/api/dashboard/summary?poly\_id=1<br>/api/dashboard/summary?date=2026-01-10&poly\_id=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date<br>poly\_id |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Summary data retrieved successfully",<br>"data": \[<br>{<br>"name": "Total Queue Today",<br>"value": 10<br>},<br>{<br>"name": "Total Patients Today",<br>"value": 10<br>},<br>{<br>"name": "Patients Completed Today",<br>"value": 3<br>},<br>{<br>"name": "No Show Patients Today",<br>"value": 1<br>}<br>\]<br>} |

### TOTAL RESERVASI PER POLI

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/reservation-trend |
|  | /api/dashboard/reservation-trend?year=2025<br>/api/dashboard/reservation-trend?year=2025&month=10<br>/api/dashboard/reservation-trend?day=15&month=10&year=2025<br>/api/dashboard/reservation-trend?year=2025&poly\_id=1<br>/api/dashboard/reservation-trend?year=2025&month=10&poly\_id=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | year<br>month<br>day<br>poly\_id |
| Request Body | null |
| Response | /api/dashboard/reservation-trend?year=2026<br>{<br>"status": "success",<br>"message": "Reservation trend data retrieved successfully",<br>"data": \[<br>{<br>"label": "2026-01-",<br>"Poli Umum": 242,<br>"Poli Gigi": 112<br>},<br>{<br>"label": "2026-02",<br>"Poli Umum": 234,<br>"Poli Gigi": 143<br>},<br>{<br>"label": "2026-03",<br>"Poli Umum": 189,<br>"Poli Gigi": 103<br>},<br>{ ... bulan 4 ... },<br>{ ... bulan 5 ... },<br>{ ... dst ... },<br>\]<br>}<br><br>/api/dashboard/reservation-trend?year=2026&month=01<br>{<br>"status": "success",<br>"message": "Reservation trend data retrieved successfully",<br>"data": \[<br>{<br>"label": "2026-01-05",<br>"Poli Umum": 23,<br>"Poli Gigi": 14<br>},<br>{<br>"label": "2026-02-06",<br>"Poli Umum": 24,<br>"Poli Gigi": 11<br>},<br>{<br>"label": "2026-03-07",<br>"Poli Umum": 19,<br>"Poli Gigi": 18<br>},<br>{ ... 2026-03-08 ... },<br>{ ... 2026-03-09 ... },<br>{ ... dst ... },<br>\]<br>}<br><br>/api/dashboard/reservation-trend?day=06&month=01&year=2026<br>{<br>"status": "success",<br>"message": "Reservation trend data retrieved successfully",<br>"data": \[<br>{<br>"label": "2026-01-05",<br>"Poli Umum": 23,<br>"Poli Gigi": 14<br>}<br>\]<br>} |

### PERBANDINGAN RESERVASI PER POLI

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/reservations-by-poly |
|  | /api/dashboard/reservations-by-poly?year=2025<br>/api/dashboard/reservations-by-poly?year=2025&month=10<br>/api/dashboard/reservations-by-poly?day=15&month=10&year=2025<br>/api/dashboard/reservations-by-poly?year=2025&poly\_id=1<br>/api/dashboard/reservations-by-poly?year=2025&month=10&poly\_id=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | year<br>month<br>day<br>poly\_id |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Reservation comparison by poly retrieved successfully",<br>"data": \[<br>{<br>"name": "Poli Umum",<br>"value": 10<br>},<br>{<br>"name": "Poli Gigi",<br>"value": 3<br>}<br>\]<br>} |

### TINGKAT KEHADIRAN PASIEN

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/patient-attendance |
|  | /api/dashboard/patient-attendance?year=2025<br>/api/dashboard/patient-attendance?year=2025&month=10<br>/api/dashboard/patient-attendance?day=15&month=10&year=2025<br>/api/dashboard/patient-attendance?year=2025&poly\_id=1<br>/api/dashboard/patient-attendance?year=2025&month=10&poly\_id=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | year<br>month<br>day<br>poly\_id |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Patient attendance data retrieved successfully",<br>"data": {<br>"summary": {<br>"attended": 20,<br>"not\_attended": 4,<br>"total": 24,<br>"attendance\_rate": 83.33<br>},<br>"chart": \[<br>{<br>"name": "Attended",<br>"value": 20<br>},<br>{<br>"name": "Not Attended",<br>"value": 4<br>}<br>\]<br>}<br>} |

### RATA RATA WAKTU TUNGGU

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/average-waiting-time |
|  | /api/dashboard/average-waiting-time?year=2025<br>/api/dashboard/average-waiting-time?year=2025&month=10<br>/api/dashboard/average-waiting-time?day=15&month=10&year=2025<br>/api/dashboard/average-waiting-time?year=2025&poly\_id=1<br>/api/dashboard/average-waiting-time?year=2025&month=10&poly\_id=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | year<br>month<br>day<br>poly\_id |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Average waiting time retrieved successfully",<br>"data": \[<br>{<br>"name": "Poli Umum",<br>"avg\_waiting\_time": "67.94" // dalam menit<br>},<br>{<br>"name": "Poli Gigi",<br>"avg\_waiting\_time": "30.91" // dalam menit<br>}<br>\]<br>} |

### JAM SIBUK KLINIK

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/clinic-peak-hours |
|  | /api/dashboard/clinic-peak-hours?date=2026-01-05<br>/api/dashboard/clinic-peak-hours?year=2026-01-05&poly\_id=1 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date<br>poly\_id |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Clinic peak hours retrieved successfully",<br>"data": \[<br>{<br>"hour": "00",<br>"value": 0<br>},<br>{<br>"hour": "01",<br>"value": 0<br>},<br>{<br>"hour": "02",<br>"value": 0<br>},<br>{<br>"hour": "03",<br>"value": 0<br>},<br>{<br>"hour": "04",<br>"value": 0<br>},<br>.....<br>{<br>"hour": "09",<br>"value": 1<br>},<br>{<br>"hour": "10",<br>"value": 1<br>},<br>{<br>"hour": "11",<br>"value": 0<br>},<br>{<br>"hour": "12",<br>"value": 1<br>},<br>{<br>"hour": "13",<br>"value": 1<br>},<br>{<br>"hour": "14",<br>"value": 2<br>},<br>{<br>"hour": "15",<br>"value": 0<br>},<br>{<br>"hour": "16",<br>"value": 0<br>},<br>{<br>"hour": "17",<br>"value": 0<br>},<br>.....<br>{<br>"hour": "21",<br>"value": 0<br>},<br>{<br>"hour": "22",<br>"value": 0<br>},<br>{<br>"hour": "23",<br>"value": 0<br>}<br>\]<br>} |

### RASIO NO-SHOW
no\_show\_ratio (%) = (no\_show\_count / total\_reservation) \* 100

#### Roles Select

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/dashboard/bpjs-vs-general |
|  | /api/dashboard/bpjs-vs-general?year=2025<br>/api/dashboard/bpjs-vs-general?year=2025&month=10<br>/api/dashboard/bpjs-vs-general?day=15&month=10&year=2025<br>/api/dashboard/bpjs-vs-general?year=2025&poly\_id=1<br>/api/dashboard/bpjs-vs-general?year=2025&month=10&poly\_id=2 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | year<br>month<br>day<br>poly\_id |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "BPJS vs general patient comparison retrieved successfully",<br>"data": \[<br>{<br>"label": "2026-01",<br>"bpjs": 7,<br>"general": 6<br>},<br>{<br>"label": "2026-02",<br>"bpjs": 7,<br>"general": 6<br>},<br>{<br>.... dst ....<br>}<br>\]<br>} |

## Report (Page & Export)

### Laporan Kunjungan Pasien (Core Report)
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/patient-visits |
|  | /api/reports/patient-visits?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>insurance\_type=BPJS&<br>status\[\]=5&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>insurance\_type // BPJS / GENERAL<br>status\[\]<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Patient visit report retrieved successfully",<br>"data": \[<br>{<br>"date": "2026-01-11",<br>"reservation\_number": 10,<br>"patient\_name": "Rahma Putri",<br>"poly": "Poli Umum",<br>"insurance\_type": "GENERAL",<br>"status": "WAITING",<br>"registration\_time": "09:15",<br>"call\_time": null,<br>"waiting\_time\_minutes": null<br>},<br>{<br>"date": "2026-01-11",<br>"reservation\_number": 11,<br>"patient\_name": "Anwar Rama",<br>"poly": "Poli Umum",<br>"insurance\_type": "BPJS",<br>"status": "WAITING",<br>"registration\_time": "10:10",<br>"call\_time": null,<br>"waiting\_time\_minutes": null<br>},<br>{ ..... DATA 3 ..... },<br>{ ..... DATA 4 ..... },<br>{ ..... SETERUSNYA ..... },<br>\],<br>"pagination": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 13,<br>"last\_page": 2<br>}<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/patient-visits/export |
|  | /api/reports/patient-visits/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>insurance\_type=BPJS&<br>status\[\]=5 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>insurance\_type // BPJS / GENERAL<br>status\[\] |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/310bd75a-772a-4da5-a31b-d79bae811b6a/image.png) |

### Laporan No Show & Cancelled
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/no-show-cancelled |
|  | /api/reports/no-show-cancelled?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>insurance\_type=BPJS&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>insurance\_type // BPJS / GENERAL<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "No-show and cancelled report retrieved successfully",<br>"data": \[<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Gigi",<br>"total\_reservations": 3,<br>"no\_show": 0,<br>"cancelled": 0,<br>"ratio\_percent": 0<br>},<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Umum",<br>"total\_reservations": 10,<br>"no\_show": 0,<br>"cancelled": 0,<br>"ratio\_percent": 0<br>}<br>\],<br>"pagination": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 2,<br>"last\_page": 1<br>}<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/no-show-cancelled/export |
|  | /api/reports/no-show-cancelled/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>insurance\_type=BPJS& |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>insurance\_type // BPJS / GENERAL |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/206fda1c-2a46-4190-add5-70bd60b8bdb1/image.png) |

### Laporan BPJS vs UMUM
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/bpjs-vs-general |
|  | /api/reports/bpjs-vs-general?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "BPJS vs General report retrieved successfully",<br>"data": \[<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Gigi",<br>"total\_bpjs": 1,<br>"total\_general": 2,<br>"bpjs\_percentage": 33.33,<br>"general\_percentage": 66.67<br>},<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Umum",<br>"total\_bpjs": 7,<br>"total\_general": 3,<br>"bpjs\_percentage": 70,<br>"general\_percentage": 30<br>}<br>\],<br>"pagination": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 2,<br>"last\_page": 1<br>}<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/bpjs-vs-general/export |
|  | /api/reports/bpjs-vs-general/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1& |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/844f7229-903b-47af-8532-d3bcf9715ba4/image.png) |

### Laporan Kinerja Poli
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/poly-performance |
|  | /api/reports/poly-performance?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Poly performance report retrieved successfully",<br>"data": \[<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Gigi",<br>"total\_patients": 3,<br>"average\_waiting\_time\_minutes": null,<br>"no\_show\_rate\_percent": 0,<br>"peak\_hour": "19:00"<br>},<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Umum",<br>"total\_patients": 70,<br>"average\_waiting\_time\_minutes": 67.94,<br>"no\_show\_rate\_percent": 10,<br>"peak\_hour": "14:00"<br>}<br>\],<br>"pagination": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 2,<br>"last\_page": 1<br>}<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/poly-performance/export |
|  | /api/reports/poly-performance/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1& |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/70e6b5a9-7669-4655-ae90-47db19329239/image.png) |

### Laporan Waktu Tunggu
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/waiting-time |
|  | /api/reports/waiting-time?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Waiting time report retrieved successfully",<br>"data": \[<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Gigi",<br>"average\_waiting\_time\_minutes": 50.92,<br>"longest\_waiting\_time\_minutes": 50.92,<br>"fastest\_waiting\_time\_minutes": 50.92<br>},<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Umum",<br>"average\_waiting\_time\_minutes": 67.94,<br>"longest\_waiting\_time\_minutes": 71,<br>"fastest\_waiting\_time\_minutes": 64.88<br>}<br>\],<br>"pagination": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 2,<br>"last\_page": 1<br>}<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/waiting-time/export |
|  | /api/reports/waiting-time/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1& |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/70e6b5a9-7669-4655-ae90-47db19329239/image.png) |

### Laporan Jam Sibuk
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/busy-hour |
|  | /api/reports/busy-hour?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "Busy hour report retrieved successfully",<br>"data": \[<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Gigi",<br>"06:00": 0,<br>"07:00": 0,<br>"08:00": 1,<br>"09:00": 0,<br>"10:00": 0,<br>"11:00": 0,<br>"12:00": 0,<br>"13:00": 0,<br>"14:00": 1,<br>"15:00": 0,<br>"16:00": 0,<br>"17:00": 0,<br>"18:00": 0,<br>"total\_reservations": 2<br>},<br>{<br>"date": "2026-01-11",<br>"poly": "Poli Umum",<br>"06:00": 0,<br>"07:00": 1,<br>"08:00": 3,<br>"09:00": 1,<br>"10:00": 1,<br>"11:00": 0,<br>"12:00": 1,<br>"13:00": 1,<br>"14:00": 2,<br>"15:00": 0,<br>"16:00": 0,<br>"17:00": 0,<br>"18:00": 0,<br>"total\_reservations": 10<br>}<br>\]<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/busy-hour/export |
|  | /api/reports/busy-hour/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>poly\_id=1& |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>poly\_id |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/db7e9027-a07b-4177-91c3-dd5da889d5c7/image.png) |

### Laporan Aktivitas User
#### Page

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/user-activity |
|  | /api/reports/user-activity?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31&<br>page=1&<br>per\_page=20 |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>user\_id<br>page<br>per\_page |
| Request Body | null |
| Response | success<br>{<br>"status": "success",<br>"message": "User activity report retrieved successfully",<br>"data": \[<br>{<br>"user": "Super Admin",<br>"role": "Superadmin",<br>"activity": "Check-in",<br>"date": "2026-01-10",<br>"reservation\_id": 20<br>},<br><br>{<br>.....<br>},<br>{<br>"user": "Super Admin",<br>"role": "Superadmin",<br>"activity": "Check-in",<br>"date": "2026-01-10",<br>"reservation\_id": 9<br>}<br>\],<br>"pagination": {<br>"current\_page": 1,<br>"per\_page": 10,<br>"total": 13,<br>"last\_page": 2<br>}<br>} |

#### Export

#### Report

| Field | Value |
| --- | --- |
| URL | {Base\_URL}/api/reports/user-activity/export |
|  | /api/reports/user-activity/export?<br>date\_from=2026-01-01&<br>date\_to=2026-01-31& |
| Method | GET |
| Header | Content-Type: application/json |
| Security | Bearer Token |
| Parameter | date\_from<br>date\_to<br>user\_id |
| Request Body | null |
| Response | FILE .XLSX<br>example:<br>![](https://t31586709.p.clickup-attachments.com/t31586709/dbd9059f-1347-4e71-a4ae-6200af9f14e3/image.png) |

###

## Dummy Data

### USER
// Kepala Klinik

```perl
{
  "name": "Nandar Sudjono",
  "username": "nandar",
  "email": "nandar@mail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [2]
}
```

// DOKTER

```perl
{
  "name": "Andi Pratama",
  "username": "andi.pratama",
  "email": "andi.pratama@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [3],
  "poly_id":1
}
{
  "name": "Budi Santoso",
  "username": "budi.santoso",
  "email": "budi.santoso@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [3],
  "poly_id":2
}
{
  "name": "Citra Lestari",
  "username": "citra.lestari",
  "email": "citra.lestari@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [3],
  "poly_id":1
}
{
  "name": "Dewi Anggraini",
  "username": "dewi.anggraini",
  "email": "dewi.anggraini@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [3],
  "poly_id":2
}
```

// PERAWAT ANAMNESA

```perl
{
  "name": "Rizky Kurniawan",
  "username": "rizky.kurniawan",
  "email": "rizky.kurniawan@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [4]
}
{
  "name": "Siti Aisyah",
  "username": "siti.aisyah",
  "email": "siti.aisyah@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [4]
}
```

// PERAWAT ASISTEN

```perl
{
  "name": "Fajar Nugroho",
  "username": "fajar.nugroho",
  "email": "fajar.nugroho@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [5]
}
{
  "name": "Nabila Putri",
  "username": "nabila.putri",
  "email": "nabila.putri@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [5]
}
```

// Administrasi

```perl
{
  "name": "Agus Setiawan",
  "username": "agus.setiawan",
  "email": "agus.setiawan@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [6]
}
{
  "name": "Dina Maharani",
  "username": "dina.maharani",
  "email": "dina.maharani@gmail.com",
  "password": "admin123",
  "password_confirmation": "admin123",
  "roles": [6]
}
```

### SCHEDULE
#### Poli Umum

```json
// WEEK 1
{
  "doctor_id": "7",
  "date": "2026-01-05",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-06",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-07",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-08",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-09",
  "start_time": "09:00",
  "end_time": "15:00"
}

// WEEK 2
{
  "doctor_id": "9",
  "date": "2026-01-12",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-13",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-14",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-15",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-16",
  "start_time": "09:00",
  "end_time": "15:00"
}

// WEEK 3
{
  "doctor_id": "7",
  "date": "2026-01-19",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-20",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-21",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-22",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-23",
  "start_time": "09:00",
  "end_time": "15:00"
}

// WEEK 4
{
  "doctor_id": "9",
  "date": "2026-01-26",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-27",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-28",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "7",
  "date": "2026-01-29",
  "start_time": "09:00",
  "end_time": "15:00"
}
{
  "doctor_id": "9",
  "date": "2026-01-30",
  "start_time": "09:00",
  "end_time": "15:00"
}
```

#### Poli Gigi

```json
// WEEK 1
{
  "doctor_id": "8",
  "date": "2026-01-05",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-06",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-07",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-08",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-09",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}

// WEEK 2
{
  "doctor_id": "10",
  "date": "2026-01-12",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-13",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-14",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-15",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-16",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}

// WEEK 3
{
  "doctor_id": "8",
  "date": "2026-01-19",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-20",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-21",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-22",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-23",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}

// WEEK 4
{
  "doctor_id": "10",
  "date": "2026-01-26",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-27",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-28",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "8",
  "date": "2026-01-29",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
{
  "doctor_id": "10",
  "date": "2026-01-30",
  "start_time": "09:00",
  "end_time": "15:00",
  "quota": 25
}
```

## WebScoket (Laravel Reverb)

### via API
### via Laravel Broadcast (Listen)

| Field | Value |
| --- | --- |
| Config | broadcaster: "reverb"<br>enabledTransports: (2) \['ws', 'wss'\]<br>forceTLS: true<br>key: "skripsi-jaya-queue-key"<br>wsHost: "[reverb-sistem-antrean.zeabur.app](http://reverb-sistem-antrean.zeabur.app)"<br>wsPort: "443"<br>wssPort: "443" |
| Payload | {<br>"umum" : {<br>"queue\_number\_anamnesa": 12,<br>"queue\_number\_with\_doctor": 15<br>},<br>"gigi" : {<br>"queue\_number\_anamnesa": 12,<br>"queue\_number\_with\_doctor": 15<br>}<br>} |