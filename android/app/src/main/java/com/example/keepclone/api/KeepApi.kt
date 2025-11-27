package com.example.keepclone.api

import com.example.keepclone.models.Note
import retrofit2.Call
import retrofit2.http.*

interface KeepApi {
    @POST("auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @GET("notes")
    fun getNotes(@Header("Authorization") token: String): Call<Map<String, Any>>

    @POST("notes")
    fun createNote(@Header("Authorization") token: String, @Body note: Note): Call<Map<String, Any>>

    @PUT("notes/{id}")
    fun updateNote(@Header("Authorization") token: String, @Path("id") id: Int, @Body note: Note): Call<Map<String, Any>>

    @DELETE("notes/{id}")
    fun deleteNote(@Header("Authorization") token: String, @Path("id") id: Int): Call<Map<String, Any>>
}
