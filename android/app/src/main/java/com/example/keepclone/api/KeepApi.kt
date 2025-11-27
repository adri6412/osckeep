package com.example.keepclone.api

import com.example.keepclone.models.Note
import retrofit2.Call
import retrofit2.http.*

interface KeepApi {
    @GET("notes")
    fun getNotes(): Call<Map<String, Any>> // Adjust return type based on actual JSON structure

    @POST("notes")
    fun createNote(@Body note: Note): Call<Map<String, Any>>

    @PUT("notes/{id}")
    fun updateNote(@Path("id") id: Int, @Body note: Note): Call<Map<String, Any>>

    @DELETE("notes/{id}")
    fun deleteNote(@Path("id") id: Int): Call<Map<String, Any>>
}
