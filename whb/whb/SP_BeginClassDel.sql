USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_BeginClassDel]    Script Date: 2015/1/6 16:52:02 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE procedure [dbo].[SP_BeginClassDel]
	@ID int
AS
	BEGIN TRY

		Declare @TC int
		Set @TC = @@TranCount

		If(@TC = 0)
			BEGIN TRANSACTION BCD
		Else
			SAVE TRANSACTION BCD

		If(object_id('tempdb.dbo.#Tmp') Is Not Null) Drop Table #Tmp

		If Exists(Select * From BeginClass Where ID = @ID And (SettlementState >= 'BSSE004' Or [State] = -1 Or DEL <> 0))
		Begin
			ROLLBACK TRANSACTION BCD
			Return 1
		End

		Select ROW_NUMBER() OVER (ORDER BY SCESettlement.ID ASC) As Row,BeginClass.BeginClassSN,RollBook.RBSN,SCESettlement.SCESSN,SCESettlement.SCESN,SCFCSettlement.SCFCSSN,SCFCSettlement.SCFCSN,SCESettlement.[Time],SCESettlement.Tuition,StudentClass.SCSN,SCESettlement.[Type] As [SCE_Type],SCFCSettlement.[Type] As [SCFC_Type] Into #Tmp
		From BeginClass
		Inner Join RollBook On BeginClass.BeginClassSN = RollBook.BeginClassSN
		Inner Join SCESettlement On RollBook.RBSN = SCESettlement.RBSN
		Inner Join SCFCSettlement On RollBook.RBSN = SCFCSettlement.RBSN
		Inner Join StudentClass On SCESettlement.SCSN = StudentClass.SCSN
		Where BeginClass.ID = @ID And BeginClass.[State] <> -1 And SCESettlement.[Time] < 0 And SCESettlement.Tuition <= 0 And SCFCSettlement.[Time] < 0 And SCFCSettlement.Tuition <= 0 And BeginClass.DEL = 0 And RollBook.DEL = 0 And SCESettlement.DEL = 0 And SCFCSettlement.DEL = 0

		Update BeginClass Set State = -1 Where ID = @ID
		
		Update SCElement Set RemainEMTuition = RemainEMTuition + Abs(Tuition),RemainEMTime = RemainEMTime + Abs([Time]) From SCElement A Inner Join (Select SCESN,SUM(Tuition) As Tuition,SUM([Time]) As [Time] From #Tmp Group By SCESN) B On A.SCESN = B.SCESN And A.DEL = 0
		Update SCFC Set AlreadyEMTuition = AlreadyEMTuition - Abs(Tuition),AlreadyEMTime = AlreadyEMTime - Abs([Time]) From SCFC A Inner Join (Select SCFCSN,SUM(Tuition) As Tuition,SUM([Time]) As [Time] From #Tmp Group By SCFCSN) B On A.SCFCSN = B.SCFCSN And A.DEL = 0

		--Delete SCESettlement Where SCESSN In (Select #Tmp.SCESSN From #Tmp)
		--Delete SCFCSettlement Where SCFCSSN In (Select #Tmp.SCFCSSN From #Tmp)

		--报班元素明细表SCESettlement
		Insert Into SCESettlement(SCESSN,SCSN,SCESN,Tuition,[Time],[Type],RBSN,RBDay,BlankOutState,BO_SCESSN,TrueTime,CreateTime,CreateUserSN,DEL) 
		Select Row,SCSN,SCESN,Abs(Tuition),Abs([Time]),[SCE_Type],Null,Null,1,SCESSN,GetDate(),GetDate(),'QK',0 From #Tmp

		Update SCESettlement Set BO_SCESSN = D.C_SCESSN,BlankOutState = 1
		From SCESettlement As A Inner Join (Select B.SCESSN As B_SCESSN,C.SCESSN As C_SCESSN From #Tmp As B Inner Join SCESettlement As C On B.SCESSN = C.BO_SCESSN Where C.DEL = 0 ) D On A.SCESSN = B_SCESSN Where A.DEL = 0
		
		--物理班收入明细表SCFCSettlement
		Insert Into SCFCSettlement(SCFCSSN,SCFCSN,Tuition,[Time],[Type],RBSN,RBDay,SCFCSN_Operate,BlankOutState,BO_SCFCSSN,TrueTime,CreateTime,CreateUserSN,DEL)
		Select Row,SCFCSN,Abs(Tuition),Abs([Time]),[SCFC_Type],Null,Null,Null,1,SCFCSSN,GetDate(),GetDate(),'QK',0 From #Tmp
		
		Update SCFCSettlement Set BO_SCFCSSN = D.C_SCFCSSN,BlankOutState = 1
		From SCFCSettlement As A Inner Join (Select B.SCFCSSN As B_SCFCSSN,C.SCFCSSN As C_SCFCSSN From #Tmp As B Inner Join SCFCSettlement As C On B.SCFCSSN = C.BO_SCFCSSN Where C.DEL = 0 ) D On A.SCFCSSN = B_SCFCSSN Where A.DEL = 0

		If(@TC = 0)
			COMMIT TRANSACTION BCD

		Return 1

	END TRY
	BEGIN CATCH
		--发生异常时回滚事务
		ROLLBACK TRANSACTION BCD
		Return -200000
	END CATCH


GO


